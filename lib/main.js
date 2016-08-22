'use strict';

const vscode = require('vscode');
const buildCommand = require('./build');

var config = vscode.workspace.getConfiguration('nsis');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return buildCommand(editor, config);
      })
    );
  },
  deactivate () { }
};
