import { type CompilerOptions, type CompilerOutput, compile as compileScript } from 'makensis';
import { commands, type WorkspaceConfiguration, window } from 'vscode';
import { getCompilerOptions, getConfiguration, getSpawnEnv, useWine } from '../makensis.ts';
import { fileExists, isWindows } from '../util.ts';
import { getCompilerChannel } from './channels.ts';
import { revealInstaller, runInstaller } from './installer.ts';

type ShowOutputView = 'Always' | 'On Warnings & Errors' | 'On Errors' | 'Never';

const HEADER_EXTENSIONS = ['.nsh', '.bnsh', '.nsdinc'];

/**
 * Saves the active script and compiles it, streaming the compiler's output into
 * the "NSIS Compiler" channel.
 */
export async function compile(strict: boolean): Promise<void> {
	const document = window.activeTextEditor?.document;

	if (document?.languageId !== 'nsis') {
		window.showErrorMessage('This command is only available for NSIS scripts.');

		return;
	}

	if (document.isUntitled || document.uri.scheme !== 'file') {
		window.showErrorMessage('Save the script to disk before compiling it.');

		return;
	}

	if (isHeaderFile(document.fileName) && !(await confirmHeaderCompile())) {
		return;
	}

	if (!(await document.save())) {
		window.showErrorMessage('The script could not be saved, so it was not compiled.');

		return;
	}

	const config = getConfiguration();
	const showOutputView = config.get<ShowOutputView>('compiler.showOutputView', 'On Errors');
	const channel = getCompilerChannel();

	channel.clear();

	if (showOutputView === 'Always') {
		channel.show(true);
	}

	let result: CompilerOutput;

	try {
		result = await compileScript(
			document.fileName,
			{
				...(await getCompilerOptions()),
				...getVerbosityOptions(config),
				// Forwarding NSIS_APP_* variables as `-D` defines is opt-in upstream,
				// and was never opted into here.
				env: false,
				// The compiler writes whole chunks, not lines, so appending as-is is
				// what keeps the output looking like a terminal.
				onData: ({ line }) => channel.append(line),
				onError: (line) => channel.append(line),
				strict: strict || config.get<boolean>('compiler.strictMode', false),
			},
			getSpawnEnv(),
		);
	} catch (error) {
		// A compiler that never started rejects with the raw stderr, not an `Error`.
		channel.appendLine(String(error || 'makensis could not be started.'));
		channel.show(true);

		window.showErrorMessage('Failed to run makensis, see the NSIS Compiler output for details.');

		return;
	}

	await reportResult(result, showOutputView);
}

function isHeaderFile(filePath: string): boolean {
	return HEADER_EXTENSIONS.some((extension) => filePath.toLowerCase().endsWith(extension));
}

/**
 * Header files are meant to be included, not compiled, so compiling one is
 * assumed to be a mistake until the user says otherwise.
 */
async function confirmHeaderCompile(): Promise<boolean> {
	const processHeaders = getConfiguration().get<string>('compiler.processHeaders', 'Disallow');

	if (processHeaders === 'Allow') {
		return true;
	}

	if (processHeaders === 'Disallow & Never Ask Me') {
		window.setStatusBarMessage('makensis: skipped header file', 5000);

		return false;
	}

	const choice = await window.showWarningMessage(
		'Compiling header files is blocked by default. You can compile this one anyway, or change the setting.',
		'Compile Anyway',
		'Open Settings',
	);

	if (choice === 'Open Settings') {
		await commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis processHeaders');
	}

	return choice === 'Compile Anyway';
}

/**
 * `makensis` drops a falsy `verbose`, so `-V0` — the one level that is falsy —
 * has to travel as a raw argument instead.
 */
function getVerbosityOptions(config: WorkspaceConfiguration): Pick<CompilerOptions, 'rawArguments' | 'verbose'> {
	const custom = config.get<string[]>('compiler.customArguments', []);
	const verbosity = config.get<string>('compiler.verbosity', '3');

	return {
		rawArguments: verbosity === '0' ? ['-V0', ...custom] : custom,
		verbose: /^[1-4]$/.test(verbosity) ? (Number(verbosity) as 1 | 2 | 3 | 4) : undefined,
	};
}

async function reportResult(result: CompilerOutput, showOutputView: ShowOutputView): Promise<void> {
	const channel = getCompilerChannel();
	const failed = result.status !== 0;
	const warnings = result.warnings;

	if (shouldShowOutputView(showOutputView, failed, warnings > 0)) {
		channel.show(true);
	}

	if (!getConfiguration().get<boolean>('compiler.showNotifications', true)) {
		return;
	}

	if (failed) {
		const choice = await window.showErrorMessage('Compilation failed, see the output for details.', 'Show Output');

		if (choice) {
			channel.show(true);
		}

		return;
	}

	const buttons = await getResultButtons(result.outFile);

	const choice = warnings
		? await window.showWarningMessage(
				`Compiled with ${warnings === 1 ? '1 warning' : `${warnings} warnings`}`,
				...buttons,
			)
		: await window.showInformationMessage('Compiled successfully', ...buttons);

	if (choice === 'Run' && result.outFile) {
		runInstaller(result.outFile);
	} else if (choice === 'Reveal' && result.outFile) {
		await revealInstaller(result.outFile);
	}
}

function shouldShowOutputView(setting: ShowOutputView, failed: boolean, hasWarnings: boolean): boolean {
	switch (setting) {
		case 'Always':
			return true;

		case 'On Warnings & Errors':
			return failed || hasWarnings;

		case 'On Errors':
			return failed;

		default:
			return false;
	}
}

async function getResultButtons(outFile: string | undefined): Promise<string[]> {
	// `outFile` is scraped from the compiler's own output, so it can name a file
	// that a `/NOCD`-style setup wrote somewhere else entirely.
	if (!outFile || !(await fileExists(outFile))) {
		return [];
	}

	return isWindows() || useWine() ? ['Run', 'Reveal'] : ['Reveal'];
}
