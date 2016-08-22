'use strict';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function makensisCommand (textEditor, textEditorEdit) {
  let doc = textEditor.document;

  let makensis = "makensis"
  let args = getPrefix() + "V2"

  doc.save()

  exec("\"" + makensis + "\" " + args + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stdout);
    } else {
      return vscode.window.showInformationMessage("Compiled successfully");
    }
  });
}

function getPrefix() {
  let prefix;

  if (os.platform() === 'win32') {
    prefix = "/";
  } else {
    prefix = "-";
  }

  return prefix;
}

module.exports = makensisCommand;
