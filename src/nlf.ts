import { trackEvent } from './telemetry';
import * as NLF from '@nsis/nlf';
import vscode from 'vscode';

function convert(): void {
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;

  if (document.languageId === 'nlf') {
    convertNLF(document);
  } else if (document.languageId === 'json') {
    convertJSON(document);
  }
}

function convertNLF(document): void {
  let input, output;
  let hasErrors = false;

  try {
    input = document.getText();
    output = NLF.parse(input, { stringify: true });
  } catch (err) {
    console.error(err);
    vscode.window.showErrorMessage('Conversion failed, see output for details');
    hasErrors = true;
  } finally {
    trackEvent('convertNLF', {
      hasErrors
    });
  }

  openNewFile({
    content: output,
    language: 'json'
  });
}

function convertJSON(document): void {
  let input, output;

  try {
    input = document.getText();
    output = NLF.stringify(input);
  } catch (err) {
    undefined
  }

  openNewFile({
    content: output,
    language: 'nlf'
  });
}

function openNewFile(newDocument): void {
  vscode.workspace.openTextDocument(newDocument).then( document => vscode.window.showTextDocument(document));
}

export { convert };
