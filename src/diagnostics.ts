import * as vscode from 'vscode';
import { compile, compileSync } from 'makensis';
import { findErrors, findWarnings, isStrictMode } from './util';

const updateDiagnostics = async (document: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> => {
  console.log('Call');
  if (document) {
    let output;

    try {
      output = await compile(document.fileName, {verbose: 2, strict: isStrictMode() });
    } catch (error) {
      console.error(error);
    }

    const diagnostics = [];

    const warnings = findWarnings(output.stdout);
    if (warnings) diagnostics.push(...warnings);

    const error = findErrors(output.stderr);
    if (error) diagnostics.push(error);

    collection.set(document.uri, diagnostics);
  } else {
    collection.clear();
  }
};

export {
  updateDiagnostics
};
