'use strict';

import * as vscode from 'vscode';

// Load package components
import { updateDiagnostics } from './diagnostics';
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { createTask } from './task';
import { convert } from './nlf';
import { nslAssembler} from './transpiler';

function activate(context: vscode.ExtensionContext): void {
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
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
    if (!editor) return;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));
}

export { activate };
