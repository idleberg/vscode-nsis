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

  let customArguments = config.nsl.customArguments || "/nomake /nopause";

  exec("java -jar \"" + nslJar + "\" " + customArguments + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
    if (error || stderr) {
      let message = !stderr ? error : stderr;
      console.error(message);
      return vscode.window.showErrorMessage("Transpile failed (see console for details)");
    } else {
      return vscode.window.showInformationMessage("Successfully transpiled \"" + doc.fileName + "\"");
    }
  });
}

module.exports = transpileCommand;
