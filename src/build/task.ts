import { Uri, type WorkspaceFolder, window, workspace } from 'vscode';
import { getConfiguration } from '../makensis.ts';

/**
 * Scaffolds a `tasks.json` with a plain and a strict build task.
 *
 * Everything goes through `workspace.fs` rather than `node:fs`, so this keeps
 * working in remote and virtual workspaces.
 */
export async function createBuildTask(): Promise<void> {
	const folder = getTargetFolder();

	if (!folder) {
		window.showErrorMessage('Build tasks need a workspace folder, and are unavailable when editing single files.');

		return;
	}

	const config = getConfiguration();
	const dotFolder = Uri.joinPath(folder.uri, '.vscode');
	const target = Uri.joinPath(dotFolder, 'tasks.json');

	if (await exists(target)) {
		const choice = await window.showWarningMessage(`${folder.name} already has a task file.`, 'Overwrite', 'Show File');

		if (choice === 'Show File') {
			await window.showTextDocument(await workspace.openTextDocument(target));

			return;
		}

		if (choice !== 'Overwrite') {
			return;
		}
	}

	try {
		await workspace.fs.createDirectory(dotFolder);
		await workspace.fs.writeFile(target, new TextEncoder().encode(`${JSON.stringify(getTaskFile(), null, 2)}\n`));
	} catch (error) {
		console.error('[idleberg.nsis]', error);
		window.showErrorMessage('Failed to write the task file, see the console for details.');

		return;
	}

	if (config.get<boolean>('buildTask.openAfterCreation', true)) {
		await window.showTextDocument(await workspace.openTextDocument(target));
	}
}

function getTaskFile(): unknown {
	// The setting is used verbatim rather than the resolved absolute path, so the
	// task file stays portable across the machines that share the workspace.
	const command = getConfiguration().get<string>('makensis.path', '').trim() || 'makensis';
	const verbosity = getConfiguration().get<string>('compiler.verbosity', '3');
	const args = /^[0-4]$/.test(verbosity) ? [`-V${verbosity}`] : [];

	return {
		version: '2.0.0',
		tasks: [
			{
				label: 'Build NSIS script',
				type: 'shell',
				command,
				// biome-ignore lint/suspicious/noTemplateCurlyInString: a VS Code task variable, not a JS template placeholder
				args: [...args, '${file}'],
				group: {
					kind: 'build',
					isDefault: true,
				},
				problemMatcher: [],
			},
			{
				label: 'Build NSIS script (strict)',
				type: 'shell',
				command,
				// biome-ignore lint/suspicious/noTemplateCurlyInString: a VS Code task variable, not a JS template placeholder
				args: [...args, '-WX', '${file}'],
				group: 'build',
				problemMatcher: [],
			},
		],
	};
}

/**
 * The folder the active script belongs to, so that a multi-root workspace does
 * not always get its task file written to the first folder.
 */
function getTargetFolder(): WorkspaceFolder | undefined {
	const folders = workspace.workspaceFolders;

	if (!folders?.length) {
		return undefined;
	}

	const document = window.activeTextEditor?.document;

	return (document && workspace.getWorkspaceFolder(document.uri)) ?? folders[0];
}

async function exists(uri: Uri): Promise<boolean> {
	try {
		await workspace.fs.stat(uri);

		return true;
	} catch {
		return false;
	}
}
