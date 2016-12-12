'use babel';

const vscode = require('vscode');

// Load package components
const buildCommand = require('./makensis');
const transpileCommand = require('./nsl');
const createTaskCommand = require('./task');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return buildCommand(editor, false);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
        return buildCommand(editor, true);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return transpileCommand(editor);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
        return createTaskCommand(editor);
      })
    );
  },
  deactivate () { }
};
