import { fileExists, getMakensisPath, isWindowsCompatible, buttonHandler } from './util';
import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import type Makensis from 'makensis/types';
import nsisChannel from './channel';
import { type MessageOptions, window } from 'vscode';

const infoChannel = window.createOutputChannel('NSIS Info', 'json');

export async function compilerOutput(data: Makensis.CompilerData): Promise<void> {
	if (!data?.line) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	nsisChannel.appendLine(data.line);

	if (showOutputView === 'Always') {
		nsisChannel.show(true);
	}
}

export async function compilerError(data: string): Promise<void> {
	if (!data) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	nsisChannel.appendLine(data);

	if (showOutputView === 'On Errors') {
		nsisChannel.show(true);
	}
}

export async function compilerExit(data: Makensis.CompilerOutput): Promise<void> {
	const { showNotifications, showOutputView } = await getConfig('nsis');

	if (data['status'] === 0) {
		if (showOutputView === 'Always') {
			nsisChannel.show(true);
		}

		const outfileExists = await fileExists(String(data.outFile));
		const buttons: string[] = [];

		if (await isWindowsCompatible() === true && data.outFile?.length && outfileExists) {
			buttons.push('Run');
		}

		if (outfileExists && ['win32', 'darwin', 'linux'].includes(platform())) {
			buttons.push('Reveal');
		}

		if (data['warnings'] && showNotifications) {
			if (showOutputView === 'On Warnings & Errors') {
				nsisChannel.show(true);
			}

			const choice = await window.showWarningMessage(`Compiled with warnings`, buttons as MessageOptions);

			if (choice) {
				await buttonHandler(choice, data.outFile);
			}
		} else if (showNotifications) {
			const choice = await window.showInformationMessage(`Compiled successfully`, buttons as MessageOptions);

			if (choice) {
				await buttonHandler(choice, data.outFile);
			}
		}
	} else if (showNotifications) {
		if (showOutputView !== 'Never') {
			nsisChannel.show(true);
		}

		if (showNotifications) {
			const choice = await window.showErrorMessage('Compilation failed, see output for details', 'Show Output');

			if (choice) {
				await buttonHandler(choice, data.outFile);
			}
		}

		if (data['stderr']?.length) {
			console.error(data['stderr']);
		}
	}
}

export async function flagsCallback(data: Makensis.CompilerOutput): Promise<void> {
	infoChannel.clear();

	const { showFlagsAsObject } = await getConfig('nsis');

	const output = data['stdout'] || data['stderr'];
	const message = (showFlagsAsObject
		? JSON.stringify(output, null, 2)
		: output
	);

	if (typeof message !== 'string') {
		return;
	}

	infoChannel.append(message);
	infoChannel.show(true);
}

export async function versionCallback(data: Makensis.CompilerOutput): Promise<void> {
	infoChannel.clear();

	const { showVersionAsInfoMessage } = await getConfig('nsis');
	const pathToMakensis = await getMakensisPath();

	const output = data.stdout || data.stderr;
	const message = `makensis ${output} (${pathToMakensis})`;

	if (showVersionAsInfoMessage === true) {
		window.showInformationMessage(message);
	} else {
		infoChannel.append(JSON.stringify({
			version: message
		}, null, 2));
		infoChannel.show(true);
	}
}
