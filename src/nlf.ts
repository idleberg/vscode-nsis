import { window, workspace } from 'vscode';

const JSON_FORMATS = ['json', 'jsonc', 'json5'];

export async function convert(): Promise<void> {
	const activeTextEditor = window.activeTextEditor;

	if (!activeTextEditor) {
		return;
	}

	const text = activeTextEditor?.document?.getText() || '';
	const isJSON = JSON_FORMATS.includes(activeTextEditor?.document?.languageId);
	const isNLF = activeTextEditor?.document?.languageId === 'nlf';

	if (isNLF) {
		await convertNLF(text);
	} else if (isJSON) {
		await convertJSON(text);
	}
}

async function convertNLF(text: string): Promise<void> {
	if (!text) {
		window.showErrorMessage('Document is empty');
		return;
	}

	try {
		const { parse: parseNLF } = await import('@nsis/nlf');
		const output = JSON.stringify(parseNLF(text), null, 2);

		await openNewFile({
			content: output,
			language: 'json',
		});
	} catch (error) {
		console.error(error);
		window.showErrorMessage('Conversion failed, see output for details');
	}
}

async function convertJSON(text: string): Promise<void> {
	if (!text) {
		window.showErrorMessage('Document is empty');
		return;
	}

	try {
		const { stringify: stringifyNLF } = await import('@nsis/nlf');
		const output = stringifyNLF(text);

		await openNewFile({
			content: output,
			language: 'nlf',
		});
	} catch (error) {
		console.error(error);
		window.showErrorMessage('Conversion failed, see output for details');
	}
}

async function openNewFile(newDocument: { language: string; content: string }): Promise<void> {
	const document = await workspace.openTextDocument(newDocument);
	await window.showTextDocument(document);
}
