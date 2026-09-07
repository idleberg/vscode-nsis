import { commands, type Disposable } from 'vscode';
import { disposeChannels } from './channels.ts';
import { compile } from './compile.ts';
import { showCompilerFlags, showCompilerVersion } from './info.ts';
import { createBuildTask } from './task.ts';

/**
 * The build system: everything that shells out to `makensis` on demand, as
 * opposed to the language features the server provides.
 */
export function registerBuildCommands(): Disposable[] {
	return [
		commands.registerCommand('nsis.compile', async () => {
			await compile(false);
		}),

		commands.registerCommand('nsis.compileStrict', async () => {
			await compile(true);
		}),

		commands.registerCommand('nsis.createBuildTask', async () => {
			await createBuildTask();
		}),

		commands.registerCommand('nsis.showCompilerVersion', async () => {
			await showCompilerVersion();
		}),

		commands.registerCommand('nsis.showCompilerFlags', async () => {
			await showCompilerFlags();
		}),

		commands.registerCommand('nsis.openSettings', async () => {
			await commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
		}),

		{ dispose: disposeChannels },
	];
}
