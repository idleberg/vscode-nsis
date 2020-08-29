'use strict';

import { basename, extname } from 'path';
import { window, workspace, Position, Range } from 'vscode';

import * as NLF from '@nsis/nlf';

function convert(): void {
  const editor = window.activeTextEditor;
  const document = editor.document;

  if (document.languageId === 'nlf') {
    convertNLF(document);
  } else if (document.languageId === 'json') {
    convertJSON(document);
  }
}

function convertNLF(document): void {
  let input, output;

  try {
    input = document.getText();
    output = NLF.parse(input, { stringify: true });
  } catch (err) {
    console.error(err);
    window.showErrorMessage('Conversion failed, see output for details');
  }

  openNewFile(document, output, 'json');
}

function convertJSON(document): void {
  let input, output;

  try {
    input = document.getText();
    output = NLF.stringify(input);
  } catch (err) {
  }

  openNewFile(document, output, 'nlf');
}

function openNewFile(document, input, targetExt): void {
  const newFileName = basename(document.fileName, extname(document.fileName));

  workspace.openTextDocument(null).then( newDocument => {
    window.showTextDocument(newDocument, 1, false).then( editor => {
      editor.edit( builder => {
        const position = new Position(0, 0);
        const range = new Range(position, position);

        builder.replace(range, input);
      });
    });
  });
}

export { convert };
