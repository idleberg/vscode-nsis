import { spawn } from 'node:child_process';
import { commands, Uri, window } from 'vscode';
import { getConfiguration, useWine } from '../makensis.ts';
import { isWindows } from '../util.ts';

/**
 * Runs the freshly built installer, detached so that it outlives the extension
 * host rather than being killed along with it.
 */
export function runInstaller(outFile: string): void {
	if (!isWindows() && !useWine()) {
		window.showWarningMessage('Running the installer requires Windows, or Wine enabled in the settings.');

		return;
	}

	const command = isWindows() ? outFile : getConfiguration().get<string>('wine.pathToWine', 'wine');
	const args = isWindows() ? [] : [outFile];

	const installer = spawn(command, args, { detached: true, stdio: 'ignore' });

	// A failed spawn surfaces as an event, not as a thrown error.
	installer.on('error', (error) => {
		console.error('[idleberg.nsis]', error);
		window.showErrorMessage(`Failed to run the installer: ${error.message}`);
	});

	installer.unref();
}

/**
 * `revealFileInOS` is built into VS Code and knows about every file manager it
 * supports, which beats guessing between `explorer`, `open` and `nautilus`.
 */
export async function revealInstaller(outFile: string): Promise<void> {
	await commands.executeCommand('revealFileInOS', Uri.file(outFile));
}
