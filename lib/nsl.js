'use babel';

const exec = require('child_process').exec;
const vscode = require('vscode');

function translateCommand (textEditor, config) {
  let doc, nsLJar;

  doc = textEditor.document;
  doc.save();

  nslJar = config.pathToJar;

  if (typeof nslJar === "undefined" || nslJar === null) {
    return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
  }

  exec("java", "-jar", `\"${nslJar}\"`, `\"${doc.fileName}\"`, function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stdout);
    } else {
      return vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
    }
  });
}

module.exports = translateCommand;
