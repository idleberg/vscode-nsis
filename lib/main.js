'use babel';

const vscode = require('vscode');
const buildCommand = require('./build');
const translateCommand = require('./nsl');

var config = vscode.workspace.getConfiguration('nsis');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return buildCommand(editor, config, false);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
        return buildCommand(editor, config, true);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.translate-nsl', (editor) => {
        return translateCommand(editor, config);
      })
    );
  },
  deactivate () { }
};
