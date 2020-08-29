import * as vscode from 'vscode';
import { compile } from 'makensis';
import { findErrors, findWarnings, getPreprocessMode, isStrictMode } from './util';

async function updateDiagnostics(document: vscode.TextDocument | null, collection: vscode.DiagnosticCollection): Promise<void> {
  if (document && document.languageId === 'nsis') {
    const defaultOptions = {
      verbose: 2,
      strict: isStrictMode()
    };

    const preprocessMode = getPreprocessMode();
    const options = {...defaultOptions, ...preprocessMode};
    let output;

    try {
      output = await compile(document.fileName, options);
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
}

export {
  updateDiagnostics
};
