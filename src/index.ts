import vscode from 'vscode';

// Load package components
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { convert } from './nlf';
import { createTask } from './task';
import { initDotEnv } from './util';
import { updateDiagnostics } from './diagnostics';

async function activate(context: vscode.ExtensionContext): Promise<void> {
  await initDotEnv();

  // Commands
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.compile', async () => {
      return await compile(false);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.compile-strict', async () => {
      return await compile(true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.show-version', async () => {
      return await showVersion();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.show-compiler-flags', async () => {
      return await showCompilerFlags();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.command-reference', async () => {
      return await showHelp();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.create-build-task', async () => {
      return await createTask();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.convert-language-file', () => {
      return convert();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.nsis.open-settings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
    })
  );

  // Diagnostics
  const collection = vscode.languages.createDiagnosticCollection('nsis');

  if (vscode.window.activeTextEditor) {
    const editor = vscode.window.activeTextEditor;

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
    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));
}

export { activate };
