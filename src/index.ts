import { commands, type ExtensionContext, languages, window, workspace } from 'vscode';
import { makensisChannel } from './channel.ts';
import { compile } from './makensis.ts';

export async function activate(context: ExtensionContext): Promise<void> {
	context.subscriptions.push(
		// TextEditor Commands
		commands.registerTextEditorCommand('extension.nsis.compile', async () => {
			return await compile(false);
		}),

		commands.registerTextEditorCommand('extension.nsis.compile-strict', async () => {
			return await compile(true);
		}),

		commands.registerCommand('extension.nsis.open-settings', async () => {
			commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
		}),
	);

	// Formatter
	// const formatterDisposable = await registerFormatter();

	// if (formatterDisposable) {
	// 	context.subscriptions.push(formatterDisposable);
	// }

	// Diagnostics
	// const { updateDiagnostics } = await import('./diagnostics.ts');
	// const collection = languages.createDiagnosticCollection('nsis');

	// if (window.activeTextEditor) {
	// 	const editor = window.activeTextEditor;

	// 	if (editor) {
	// 		const document = editor.document || null;

	// 		updateDiagnostics(document, collection);
	// 	}
	// }

	// context.subscriptions.push(
	// 	workspace.onDidSaveTextDocument(() => {
	// 		const editor = window.activeTextEditor;

	// 		if (editor) {
	// 			const document = editor.document || null;

	// 			updateDiagnostics(document, collection);
	// 		}
	// 	}),

	// 	window.onDidChangeActiveTextEditor((editor) => {
	// 		if (editor) {
	// 			const document = editor.document || null;

	// 			updateDiagnostics(document, collection);
	// 		}
	// 	}),
	// );
}

export async function deactivate(context: ExtensionContext): Promise<void> {
	makensisChannel.dispose();
}
