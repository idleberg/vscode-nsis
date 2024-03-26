import { fileExists, getMakensisPath, isWindowsCompatible, buttonHandler } from './util';
import { getConfig } from 'vscode-get-config';
import { infoChannel, makensisChannel } from './channel';
import { platform } from 'node:os';

import { window } from 'vscode';
import type Makensis from 'makensis/types';

export async function compilerOutput(data: Makensis.CompilerData): Promise<void> {
	if (!data?.line) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	makensisChannel.appendLine(data.line);

	if (showOutputView === 'Always') {
		makensisChannel.show(true);
	}
}

export async function compilerError(data: string): Promise<void> {
	if (!data) {
		return;
	}

	const { showOutputView } = await getConfig('nsis');

	makensisChannel.appendLine(data);

	if (showOutputView === 'On Errors') {
		makensisChannel.show(true);
	}
}

export async function compilerExit(data: Makensis.CompilerOutput): Promise<void> {
	const { showNotifications, showOutputView } = await getConfig('nsis');

	if (data['status'] === 0) {
		if (showOutputView === 'Always') {
			makensisChannel.show(true);
		}

		const outfileExists = await fileExists(String(data.outFile));

		const openButton = (await isWindowsCompatible() === true && data.outFile?.length && outfileExists)
			? 'Run'
			: '';
		const revealButton = (outfileExists && ['win32', 'darwin', 'linux'].includes(platform()))
			? 'Reveal'
			: '';

		if (data['warnings'] && showNotifications) {
			if (showOutputView === 'On Warnings & Errors') {
				makensisChannel.show(true);
			}

			const choice = await window.showWarningMessage(`Compiled with warnings`, openButton, revealButton);

			if (choice) {
				await buttonHandler(choice, data.outFile);
			}
		} else if (showNotifications) {
			const choice = await window.showInformationMessage(`Compiled successfully`, openButton, revealButton);

			if (choice) {
				await buttonHandler(choice, data.outFile);
			}
		}
	} else if (showNotifications) {
		if (showOutputView !== 'Never') {
			makensisChannel.show(true);
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
