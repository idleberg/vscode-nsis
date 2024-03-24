import { fileExists, getMakensisPath, isWindowsCompatible, buttonHandler } from './util';
import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import type Makensis from 'makensis/types';
import nsisChannel from './channel';
import { window } from 'vscode';

export async function compilerOutputHandler(data: Makensis.CompilerData): Promise<void> {
	console.log('compilerOutputHandler', data);
	if (!data?.line) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	nsisChannel.appendLine(data.line);

	if (showOutputView === 'Always') {
		nsisChannel.show(true);
	}
}

export async function compilerErrorHandler(data: Makensis.CompilerData): Promise<void> {
	console.log('compilerErrorHandler', data);
	if (!data?.line) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	nsisChannel.appendLine(data.line);

	if (showOutputView === 'On Errors') {
		nsisChannel.show(true);
	}
}

export async function compilerExitHandler(data: Makensis.CompilerData): Promise<void> {
	console.log('compilerExitHandler', data);
	const { showNotifications, showOutputView } = await getConfig('nsis');

	if (data['status'] === 0) {
		if (showOutputView === 'Always') {
			nsisChannel.show(true);
		}

		const outfileExists = await fileExists(String(data.outFile));

		const openButton = (await isWindowsCompatible() === true && data.outFile?.length && outfileExists)
			? 'Run'
			: undefined;

		const revealButton = (outfileExists && ['win32', 'darwin', 'linux'].includes(platform()))
			? 'Reveal'
			: undefined;

		if (data['warnings'] && showNotifications) {
			if (showOutputView === 'On Warnings & Errors') {
				nsisChannel.show(true);
			}

			const choice = await window.showWarningMessage(`Compiled with warnings`, openButton, revealButton);
			await buttonHandler(choice, data.outFile);
		} else if (showNotifications) {
			const choice = await window.showInformationMessage(`Compiled successfully`, openButton, revealButton);
			await buttonHandler(choice, data.outFile);
		}
	} else if (showNotifications) {
		if (showOutputView !== 'Never') {
			nsisChannel.show(true);
		}

		if (showNotifications) {
			const choice = await window.showErrorMessage('Compilation failed, see output for details', 'Show Output');
			await buttonHandler(choice);
		}

		if (data['stderr']?.length) {
			console.error(data['stderr']);
		}
	}
}

export async function flagsHandler(data: unknown): Promise<void> {
	const { showFlagsAsObject } = await getConfig('nsis');

	const output = data['stdout'] || data['stderr'];
	const message = (showFlagsAsObject
		? JSON.stringify(output, null, 2)
		: output
	);

	nsisChannel.append(message);
	nsisChannel.show(true);
}

export async function versionHandler(data: unknown): Promise<void> {
	const { showVersionAsInfoMessage } = await getConfig('nsis');
	const pathToMakensis = await getMakensisPath();

	const output = data.stdout || data.stderr;
	const message = `makensis ${output} (${pathToMakensis})`;

	if (showVersionAsInfoMessage === true) {
		window.showInformationMessage(message);
	} else {
		nsisChannel.append(message);
		nsisChannel.show(true);
	}
}
