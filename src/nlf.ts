import { sendTelemetryEvent } from './telemetry';
import * as NLF from '@nsis/nlf';
import { workspace, window } from 'vscode';

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
  let input, output;
  let hasErrors = false;

  try {
    input = document.getText();
    output = NLF.parse(input, { stringify: true });
  } catch (err) {
    console.error(err);
    window.showErrorMessage('Conversion failed, see output for details');
    hasErrors = true;
  } finally {
    sendTelemetryEvent('convertNLF', {
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
  workspace.openTextDocument(newDocument).then( document => window.showTextDocument(document));
}
