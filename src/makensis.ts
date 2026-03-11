import { window } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { makensisChannel } from './channel';
import type { NsisConfig } from './nsis-bridge/src';
import { compileScript, isHeaderFile } from './nsis-bridge/src';
import { getSpawnEnv } from './utils';

export async function compile(isStrict: boolean): Promise<void> {
	const activeTextEditor = window?.activeTextEditor;

	if (!activeTextEditor) {
		return;
	}

	const document = activeTextEditor.document;

	const isNsis = activeTextEditor?.document?.languageId === 'nsis';

	if (!isNsis) {
		makensisChannel.appendLine('This command is only available for NSIS files');
		return;
	}

	if (isHeaderFile(document.fileName)) {
	}

	try {
		await document.save();
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
		window.showErrorMessage('Error saving file, see console for details');
		return;
	}

	const { compiler, processHeaders, showFlagsAsObject, wine, formatter } = await getConfig('nsis');

	const config: NsisConfig = {
		compiler,
		processHeaders,
		showFlagsAsObject,
		wine: {
			enabled: wine.runWithWine,
			path: wine.pathToWine,
		},
		formatter,
	};

	makensisChannel.clear();

	try {
		await compileScript(document.fileName, {
			config,
			strict: isStrict,
			onData: console.log,
			onError: console.error,
			// onData: async (data) => await compilerOutput(data),
			// onError: async (data) => await compilerError(data),
			// onClose: async (data) => await compilerExit(data),
			spawnOptions: { env: await getSpawnEnv() },
		});
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
	}
}
