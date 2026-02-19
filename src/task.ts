import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { window, workspace } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { fileExists, getPrefix, inRange } from './util';

export async function createTask(): Promise<unknown> {
	if (typeof workspace.workspaceFolders === 'undefined') {
		return window.showErrorMessage(
			'Task support is only available when working on a workspace folder. It is not available when editing single files.',
		);
	}

	const { alwaysOpenBuildTask, compiler } = await getConfig('nsis');
	const prefix = getPrefix();
	const verbosity = inRange(compiler.verbosity, 0, 4) ? `${prefix}V${compiler.verbosity}` : undefined;

	const taskFile = {
		version: '2.0.0',
		tasks: [
			{
				label: 'Build',
				type: 'shell',
				command: 'makensis',
				// biome-ignore lint/suspicious/noTemplateCurlyInString: false positive
				args: [verbosity, '${file}'],
				group: 'build',
			},
			{
				label: 'Build (strict)',
				type: 'shell',
				command: 'makensis',
				// biome-ignore lint/suspicious/noTemplateCurlyInString: false positive
				args: [verbosity, `${prefix}WX`, '${file}'],
				group: 'build',
			},
		],
	};

	if (!workspace.workspaceFolders[0]?.uri.fsPath) {
		window.showErrorMessage('Did not find workspace folder.');
		return;
	}

	const jsonString = JSON.stringify(taskFile, null, 2);
	const dotFolder = join(workspace.workspaceFolders[0].uri.fsPath, '/.vscode');
	const buildFile = join(dotFolder, 'tasks.json');

	try {
		await fs.mkdir(dotFolder);
	} catch {
		console.warn('[idleberg.nsis] This workspace already contains a .vscode folder.');
	}

	if (await fileExists(buildFile)) {
		const overwrite = 'Overwrite';
		const result = await window.showWarningMessage('This workspace already has a task file.', overwrite, 'Cancel');

		if (result !== overwrite) {
			return;
		}
	}

	try {
		await fs.writeFile(buildFile, jsonString);

		if (alwaysOpenBuildTask) {
			const taskFile = await workspace.openTextDocument(buildFile);
			window.showTextDocument(taskFile);
		}
	} catch (error) {
		console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
	}
}
