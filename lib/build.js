'use strict';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function buildCommand (textEditor, config) {
  let doc, makensis, args

  doc = textEditor.document;

  makensis = config.pathToMakensis;
  args = config.compilerArguments || getDefaultPrefix();

  doc.save()

  exec("\"" + makensis + "\" " + args + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stdout);
    } else {
      return vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
    }
  });
}

function getDefaultPrefix() {
  if (os.platform() === 'win32') {
    return "/V2";
  } else {
    return "-V2";
  }
}

module.exports = buildCommand;
