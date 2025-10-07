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
		window.showErrorMessage(
			'This workspace already has a task file. If you want to overwrite it, delete it manually and try again.',
		);
		return;
	}

	// ignore errors for now
	try {
		await fs.writeFile(buildFile, jsonString);
	} catch (error) {
		window.showErrorMessage(error.toString());
	}

	if (alwaysOpenBuildTask === false) return;

	// Open tasks.json
	const doc = await workspace.openTextDocument(buildFile);
	window.showTextDocument(doc);
}
