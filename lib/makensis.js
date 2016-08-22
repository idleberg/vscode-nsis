'use strict';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

var which, prefix

if (os.platform() === 'win32') {
  which = "where";
  prefix = "/";
} else {
  which = "which";
  prefix = "-";
}

module.exports = makensisCommand;

function makensisCommand (textEditor, textEditorEdit) {
  let doc = textEditor.document;

  let makensis = "makensis"
  let args = prefix + "V2"

  console.log(vscode.window.getConfiguration("nsis"))

  // Save script before compiling
  doc.save()

  exec("\"" + makensis + "\" " + args + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stdout);
    } else {
      return vscode.window.showInformationMessage("Compiled successfully");
    }
  });
}