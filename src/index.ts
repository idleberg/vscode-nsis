import { commands, type ExtensionContext, window, workspace } from 'vscode';
import { registerBuildCommands } from './build/index.ts';
import {
	disposeOutputChannel,
	getOutputChannel,
	getServerBinary,
	notifyConfigurationChange,
	restartClient,
	startClient,
	stopClient,
} from './client.ts';
import { registerDocumentLinkProvider } from './links.ts';
import { resetCompilerState } from './makensis.ts';
import { migrateSettings } from './migrate.ts';
import { convertLanguageFile } from './nlf.ts';

/**
 * Settings that only reach the server through `initializationOptions`, and so
 * need a restart rather than a `didChangeConfiguration` notification.
 */
const RESTART_ON_CHANGE = ['nsis.serverPath'];

/**
 * Settings the build system caches something for, and so has to be told about.
 */
const RESET_COMPILER_ON_CHANGE = ['nsis.makensis.path', 'nsis.wine'];

export async function activate(context: ExtensionContext): Promise<void> {
	// Runs before the client starts, so the server is initialised with the
	// migrated values rather than the defaults the old keys fell back to.
	await migrateSettings();

	context.subscriptions.push(
		...registerBuildCommands(),
		registerDocumentLinkProvider(),
		commands.registerCommand('nsis.convertLanguageFile', async () => {
			await convertLanguageFile();
		}),

		commands.registerCommand('nsis.restartServer', async () => {
			await restartClient(context);
		}),

		commands.registerCommand('nsis.showOutput', () => {
			getOutputChannel().show();
		}),

		commands.registerCommand('nsis.showServerVersion', async () => {
			const binary = getServerBinary();

			if (binary) {
				window.showInformationMessage(`${binary.version} (${binary.source}: ${binary.path})`);
			} else {
				window.showWarningMessage('The nsis-lsp language server is not running.');
			}
		}),

		workspace.onDidChangeConfiguration(async (event) => {
			if (!event.affectsConfiguration('nsis')) {
				return;
			}

			if (RESET_COMPILER_ON_CHANGE.some((section) => event.affectsConfiguration(section))) {
				resetCompilerState();
			}

			if (RESTART_ON_CHANGE.some((section) => event.affectsConfiguration(section))) {
				await restartClient(context);
			} else {
				await notifyConfigurationChange();
			}
		}),

		// Disposed after `deactivate` has stopped the client, so the server's
		// shutdown still has somewhere to log.
		{ dispose: disposeOutputChannel },
	);

	await startClient(context);
}

export async function deactivate(): Promise<void> {
	await stopClient();
}
