import { commands, type ExtensionContext, type LogOutputChannel, window, workspace } from 'vscode';
import {
	DidChangeConfigurationNotification,
	LanguageClient,
	type LanguageClientOptions,
	RevealOutputChannelOn,
	type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServer, type ServerBinary } from './server.ts';

let client: LanguageClient | undefined;
let outputChannel: LogOutputChannel | undefined;
let binary: ServerBinary | undefined;

export function getOutputChannel(): LogOutputChannel {
	if (!outputChannel) {
		outputChannel = window.createOutputChannel('NSIS Language Server', { log: true });
	}

	return outputChannel;
}

/**
 * The client only disposes an output channel it created itself, and this one is
 * handed to it through `clientOptions`, so it has to be disposed here.
 */
export function disposeOutputChannel(): void {
	outputChannel?.dispose();
	outputChannel = undefined;
}

export function getServerBinary(): ServerBinary | undefined {
	return binary;
}

export async function startClient(context: ExtensionContext): Promise<void> {
	const channel = getOutputChannel();

	binary = await resolveServer(context);

	if (!binary) {
		channel.error('No nsis-lsp binary could be found');
		await reportMissingServer();

		return;
	}

	channel.info(`Using ${binary.version} at ${binary.path} (${binary.source})`);

	const serverOptions: ServerOptions = {
		run: { command: binary.path },
		debug: { command: binary.path },
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'nsis' }],
		outputChannel: channel,
		revealOutputChannelOn: RevealOutputChannelOn.Never,
		initializationOptions: getInitializationOptions(),
	};

	client = new LanguageClient('nsis', 'NSIS Language Server', serverOptions, clientOptions);

	await client.start();
}

export async function stopClient(): Promise<void> {
	if (!client) {
		return;
	}

	const stopping = client;
	client = undefined;

	await stopping.stop();
}

export async function restartClient(context: ExtensionContext): Promise<void> {
	await stopClient();
	await startClient(context);
}

/**
 * The server replaces its settings wholesale and expects them in the shape of
 * `initializationOptions`, not as the raw `nsis` section, so the notification
 * is sent by hand instead of through the client's `synchronize` option.
 */
export async function notifyConfigurationChange(): Promise<void> {
	await client?.sendNotification(DidChangeConfigurationNotification.type, {
		settings: getInitializationOptions(),
	});
}

/**
 * Maps `nsis.*` settings onto the server's `InitOptions`. Note the case
 * change: VS Code settings are camelCase, the server reads snake_case.
 */
function getInitializationOptions(): Record<string, unknown> {
	const config = workspace.getConfiguration('nsis');
	const commentStyle = config.get<string>('formatter.commentStyle', '(preserve)');
	const endOfLine = config.get<string>('formatter.endOfLine', '(auto)');
	const preprocessMode = config.get<string>('diagnostics.preprocessMode', 'ppo');

	return {
		diagnostics: {
			// A full compilation is what the server does when it gets no mode.
			preprocess_mode: preprocessMode === 'none' ? null : preprocessMode,
			enabled_on_save: config.get<boolean>('diagnostics.enabledOnSave', true),
		},
		formatter: {
			// Anything the server does not recognise leaves comments as they are.
			comment_style: commentStyle === '(preserve)' ? null : commentStyle,
			end_of_line: endOfLine === '(auto)' ? null : endOfLine,
			print_width: config.get<number>('formatter.printWidth', 0),
			single_quote: config.get<boolean>('formatter.singleQuote', false),
			trim_empty_lines: config.get<boolean>('formatter.trimEmptyLines', true),
		},
		makensis: {
			path: config.get<string>('makensis.path', ''),
		},
	};
}

async function reportMissingServer(): Promise<void> {
	const choice = await window.showErrorMessage(
		'The nsis-lsp language server could not be found. Install it with `cargo install nsis-lsp`, or point the extension at an existing binary.',
		'Open Settings',
		'Show Output',
	);

	if (choice === 'Open Settings') {
		await commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis serverPath');
	} else if (choice === 'Show Output') {
		getOutputChannel().show();
	}
}
