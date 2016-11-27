'use babel';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function buildCommand (textEditor, config, strictMode) {
  let doc, makensis, compilerArguments;

  doc = textEditor.document;
  doc.save();

  makensis = config.pathToMakensis;
  prefix = getDefaultPrefix();

  compilerArguments = config.compilerArguments || `${prefix}V2`;

  // only add WX flag if not already specified
  if (strictMode === true && compilerArguments.indexOf(prefix + "WX") === -1) {
    compilerArguments = `${compilerArguments} ${prefix}WX`;
  }

  exec("\"" + makensis + "\" " + compilerArguments + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (error !== null) {
      detail = !stdout ? error : stdout;
      return vscode.window.showErrorMessage(detail);
    } else {
      if (stdout.indexOf("warning: ") !== -1) {
        console.warn(stdout);
        return vscode.window.showWarningMessage("Compiled with warnings");
      } else {
        return vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
      }
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
