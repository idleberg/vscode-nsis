'use babel';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function buildCommand (textEditor, config, strictMode) {
  let doc, makensis, args;

  doc = textEditor.document;

  makensis = config.pathToMakensis;
  prefix = getDefaultPrefix();

  args = config.compilerArguments || `${prefix}V2`;

  if (strictMode === true) {
    args = `${args} ${prefix}WX`;
  }

  doc.save();

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
    return "/";
  } else {
    return "-";
  }
}

module.exports = buildCommand;
