import * as NSIS from 'makensis';
import { commands, window } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { compilerError, compilerExit, compilerOutput, flagsCallback, versionCallback } from './callbacks';
import { makensisChannel } from './channel';
import { getMakensisPath, getSpawnEnv, isHeaderFile, openURL, pathWarning } from './util';

export async function compile(strictMode: boolean): Promise<void> {
	const activeTextEditor = window?.activeTextEditor;

	if (!activeTextEditor) {
		return;
	}

	const isNsis = activeTextEditor?.document?.languageId === 'nsis';

	if (!isNsis) {
		makensisChannel.appendLine('This command is only available for NSIS files');
		return;
	}

	const { compiler, processHeaders, showFlagsAsObject } = await getConfig('nsis');
	const document = activeTextEditor.document;

	if (isHeaderFile(document.fileName)) {
		if (processHeaders === 'Disallow') {
			const choice = await window.showWarningMessage(
				'Compiling header files is blocked by default. You can allow it in the package settings, or mute this warning.',
				'Open Settings',
			);
			if (choice === 'Open Settings') {
				commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis processHeaders');
				return;
			}
		} else if (processHeaders === 'Disallow & Never Ask Me') {
			window.setStatusBarMessage('makensis: Skipped header file', 5000);
			return;
		}
	}

	try {
		await document.save();
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
		window.showErrorMessage('Error saving file, see console for details');
		return;
	}

	makensisChannel.clear();

	try {
		await NSIS.compile(
			document.fileName,
			{
				env: false,
				events: true,
				json: showFlagsAsObject,
				onData: async (data) => await compilerOutput(data),
				onError: async (data) => await compilerError(data),
				onClose: async (data) => await compilerExit(data),
				pathToMakensis: await getMakensisPath(),
				rawArguments: compiler.customArguments,
				strict: strictMode || compiler.strictMode,
				verbose: compiler.verbosity,
			},
			await getSpawnEnv(),
		);
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
	}
}

export async function showVersion(): Promise<void> {
	await makensisChannel.clear();

	try {
		await NSIS.version(
			{
				events: true,
				onClose: async (data) => await versionCallback(data),
				pathToMakensis: await getMakensisPath(),
			},
			await getSpawnEnv(),
		);
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
	}
}

export async function showCompilerFlags(): Promise<void> {
	const { showFlagsAsObject } = await getConfig('nsis');
	const pathToMakensis = await getMakensisPath();

	await makensisChannel.clear();

	try {
		await NSIS.headerInfo(
			{
				events: true,
				json: showFlagsAsObject || false,
				onClose: flagsCallback,
				pathToMakensis: pathToMakensis || undefined,
			},
			await getSpawnEnv(),
		);
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
	}
}

export async function showHelp(): Promise<void> {
	makensisChannel.clear();

	let pathToMakensis: string;

	try {
		pathToMakensis = await getMakensisPath();
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
		await pathWarning();

		return;
	}

	let command: string | undefined;

	try {
		const output = await NSIS.commandHelp(
			'',
			{
				pathToMakensis: pathToMakensis,
				json: true,
			},
			await getSpawnEnv(),
		);
		command = (await window.showQuickPick(Object.keys(output.stdout as string))) || undefined;

		if (command) {
			openURL(command);
		}
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof error ? error.message : error);
	}
}
