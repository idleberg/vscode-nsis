'use strict';

const vscode = require('vscode');
const makensisCommand = require('./makensis');

var config = vscode.workspace.getConfiguration('nsis');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return makensisCommand(editor, config);
      })
    );
  },
  deactivate () { }
};
