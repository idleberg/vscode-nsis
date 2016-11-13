'use babel';

const exec = require('child_process').exec;
const vscode = require('vscode');

function transpileCommand (textEditor, config) {
  let doc, nslCmd, nsLJar;

  doc = textEditor.document;
  doc.save();

  nslJar = config.nsl.pathToJar;

  if (typeof nslJar === "undefined" || nslJar === null) {
    return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
  }

  let customArguments = config.nsl.customArguments || "/nopause /nomake";

  exec("java -jar \"" + nslJar + "\" " + customArguments + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (stderr !== "") {
      return vscode.window.showErrorMessage(stderr);
    } else {
      return vscode.window.showInformationMessage("Successfully transpiled \"" + doc.fileName + "\"");
    }
  });
}

module.exports = transpileCommand;
