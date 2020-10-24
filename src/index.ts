'use strict';

import { commands, ExtensionContext, languages, window, workspace } from 'vscode';

// Load package components
import { updateDiagnostics } from './diagnostics';
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { createTask } from './task';
import { convert } from './nlf';

async function activate(context: ExtensionContext): Promise<void> {
  // Commands
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.compile', async () => {
      return await compile(false);
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.compile-strict', async () => {
      return await compile(true);
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.show-version', async () => {
      return await showVersion();
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.show-compiler-flags', async () => {
      return await showCompilerFlags();
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.command-reference', async () => {
      return await showHelp();
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.create-build-task', async () => {
      return await createTask();
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.convert-language-file', () => {
      return convert();
    })
  );

  // Diagnostics
  const collection = languages.createDiagnosticCollection('nsis');

  if (window.activeTextEditor) {
    const editor = window.activeTextEditor;
    if (!editor) return;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }

  context.subscriptions.push(workspace.onDidSaveTextDocument(() => {
    const editor = window.activeTextEditor;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));

  context.subscriptions.push(window.onDidChangeActiveTextEditor(editor => {
    if (!editor) return;

    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));
}

export { activate };
