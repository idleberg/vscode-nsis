'use strict';

import * as vscode from 'vscode';

// Load package components
import { updateDiagnostics } from './diagnostics';
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { createTask } from './task';
import { convert } from './nlf';
import { bridleNsis, nslAssembler} from './transpiler';

const activate = (context: vscode.ExtensionContext) => {
  // Commands
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
      return compile(false);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
      return compile(true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.show-version', (editor) => {
      return showVersion();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.show-compiler-flags', (editor) => {
      return showCompilerFlags();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.command-reference', (editor) => {
      return showHelp();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.transpile-bridlensis', (editor) => {
      return bridleNsis();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
      return nslAssembler();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
      return createTask();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.convert-language-file', (editor) => {
      return convert();
    })
  );

  // Diagnostics
  const collection = vscode.languages.createDiagnosticCollection('nsis');

  if (vscode.window.activeTextEditor) {
    const document = vscode.window.activeTextEditor.document || null;
    if (document && document.languageId === 'nsis') {
      updateDiagnostics(document, collection);
    }
  }

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
    const document = vscode.window.activeTextEditor.document || null;
    if (document && document.languageId === 'nsis') {
      updateDiagnostics(document, collection);
    }
  }));

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
    const document = editor.document || null;
    if (document && document.languageId === 'nsis') {
      updateDiagnostics(document, collection);
    }
  }));
};

export { activate };
