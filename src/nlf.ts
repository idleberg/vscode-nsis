import { parse, stringify } from '@nsis/nlf';
import { window, workspace } from 'vscode';
import { getConfiguration } from './makensis.ts';

/**
 * `stringify` accepts JSON5, so the dialects VS Code distinguishes are all
 * valid input.
 */
const JSON_LANGUAGES = ['json', 'jsonc', 'json5'];

/**
 * Converts the active document between the NSIS language file format and JSON,
 * in whichever direction its language implies.
 *
 * The result opens as an untitled document rather than replacing the original,
 * so a conversion that is not what was wanted costs nothing to discard.
 */
export async function convertLanguageFile(): Promise<void> {
	const document = window.activeTextEditor?.document;
	const toJson = document?.languageId === 'nlf';

	if (!document || (!toJson && !JSON_LANGUAGES.includes(document.languageId))) {
		window.showErrorMessage('Open an NSIS language file or a JSON document to convert.');

		return;
	}

	const text = document.getText();

	if (!text.trim()) {
		window.showErrorMessage('The document is empty.');

		return;
	}

	let content: string;

	try {
		content = toJson ? JSON.stringify(parse(text), null, 2) : stringify(text, getStringifierOptions());
	} catch (error) {
		// The parser reports the offending line, so the message is worth showing
		// rather than pointing at a console the user has to go find.
		console.error('[idleberg.nsis]', error);
		window.showErrorMessage(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);

		return;
	}

	await window.showTextDocument(await workspace.openTextDocument({ content, language: toJson ? 'json' : 'nlf' }));
}

/**
 * Language files are consumed by `makensis` on Windows, so the line endings are
 * worth being deliberate about. `(auto)` is left to the library, which picks by
 * platform.
 */
function getStringifierOptions(): { eol?: 'crlf' | 'lf' } {
	const endOfLine = getConfiguration().get<string>('formatter.endOfLine', '(auto)');

	return endOfLine === 'crlf' || endOfLine === 'lf' ? { eol: endOfLine } : {};
}
