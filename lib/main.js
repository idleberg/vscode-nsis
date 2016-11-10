'use babel';

const vscode = require('vscode');
const buildCommand = require('./makensis');
const transpileCommand = require('./nsl');

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
      vscode.commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return transpileCommand(editor, config);
      })
    );
  },
  deactivate () { }
};
