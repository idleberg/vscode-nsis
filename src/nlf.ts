'use strict';

import { basename, extname } from 'path';
import { window, workspace, Position, Range, WorkspaceConfiguration } from 'vscode';

import * as NLF from '@nsis/nlf';

const convert = () => {
  const editor = window.activeTextEditor;
  const doc = editor.document;

  if (doc.languageId === 'nlf') {
    convertNLF(doc);
  } else if (doc.languageId === 'json') {
    convertJSON(doc);
  }
};

const convertNLF = (doc) => {
  let input, output;

  try {
    input = doc.getText();
    output = NLF.parse(input, { stringify: true });
  } catch (err) {
    console.error(err);
    return window.showErrorMessage('Conversion failed, see output for details');
  }

  openNewFile(doc, output, 'json');
};

const convertJSON = (doc) => {
  let input, output;

  try {
    input = doc.getText();
    output = NLF.stringify(input);
  } catch (err) {
  }

  openNewFile(doc, output, 'nlf');
};

const openNewFile = (doc, input, targetExt) => {
  const newFileName = basename(doc.fileName, extname(doc.fileName));

  workspace.openTextDocument(null).then( newDocument => {
    window.showTextDocument(newDocument, 1, false).then( editor => {
      editor.edit( builder => {
        const position = new Position(0, 0);
        const range = new Range(position, position);
        builder.replace(range, input);
      });
    });
  });
};

export { convert };
