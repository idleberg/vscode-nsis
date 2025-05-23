import * as NLF from '@nsis/nlf';
import { window, workspace } from 'vscode';

export function convert(): void {
	const editor = window.activeTextEditor;

	if (!editor) {
		return;
	}

	const document = editor.document;

	if (document.languageId === 'nlf') {
		convertNLF(document);
	} else if (document.languageId === 'json') {
		convertJSON(document);
	}
}

function convertNLF(document): void {
	let input: string;
	let output = '';

	try {
		input = document.getText();
		output = NLF.parse(input, { stringify: true });
	} catch (err) {
		console.error(err);
		window.showErrorMessage('Conversion failed, see output for details');
	}

	openNewFile({
		content: output,
		language: 'json',
	});
}

function convertJSON(document): void {
	let input: string;
	let output = '';

	try {
		input = document.getText();
		output = NLF.stringify(input);
	} catch (error) {
		console.error(`[vscode-nsis] ${error.message}`);
	}

	openNewFile({
		content: output,
		language: 'nlf',
	});
}

function openNewFile(newDocument): void {
	workspace.openTextDocument(newDocument).then((document) => window.showTextDocument(document));
}
