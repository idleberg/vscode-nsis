'use strict';

const vscode = require('vscode');
const makensisCommand = require('./makensis');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor, textEdit) => {
        return makensisCommand(editor, textEdit);
      })
    );
  },
  deactivate () { }
};
