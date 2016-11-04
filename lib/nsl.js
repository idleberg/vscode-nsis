'use babel';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function translateCommand (textEditor, config) {
  let doc, nslCmd, nsLJar;

  doc = textEditor.document;
  doc.save();

  nslJar = config.pathToJar;

  if (typeof nslJar === "undefined" || nslJar === null) {
    return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
  }

  if (os.platform() === 'win32') {
    nslCmd = "java -jar \"" + nslJar + "\" /nopause /nomake \"" + doc.fileName + "\"";
  } else {
    nslCmd = "java -jar " + nslJar + " /nopause /nomake " + doc.fileName;
  }

  exec(nslCmd, function(error, stdout, stderr) {
    if (stderr !== "") {
      return vscode.window.showErrorMessage(stderr);
    } else {
      return vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
    }
  });
}

module.exports = translateCommand;
