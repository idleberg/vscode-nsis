import { commands, type ExtensionContext, languages, window, workspace } from 'vscode';

// Load package components
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { convert } from './nlf';
import { createTask } from './task';
import { getConfig } from 'vscode-get-config';
import { reporter } from './telemetry';
import { updateDiagnostics } from './diagnostics';

async function activate(context: ExtensionContext): Promise<void> {
  const { disableTelemetry } = await getConfig('applescript');

  if (disableTelemetry === false) {
    context.subscriptions.push(reporter);
  }

  context.subscriptions.push(
    // TextEditor Commands
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
    commands.registerTextEditorCommand('extension.nsis.create-build-task', async () => {
      return await createTask();
    })
  );

  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.nsis.convert-language-file', () => {
      return convert();
    })
  );

  //Global Commands
  context.subscriptions.push(
    commands.registerCommand('extension.nsis.show-version', async () => {
      return await showVersion();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('extension.nsis.show-compiler-flags', async () => {
      return await showCompilerFlags();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('extension.nsis.command-reference', async () => {
      return await showHelp();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('extension.nsis.open-settings', () => {
      commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
    })
  );

  // Diagnostics
  const collection = languages.createDiagnosticCollection('nsis');

  if (window.activeTextEditor) {
    const editor = window.activeTextEditor;

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
    if (editor) {
      const document = editor.document || null;

      updateDiagnostics(document, collection);
    }
  }));
}

export { activate };
