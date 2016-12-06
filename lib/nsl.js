'use babel';

const path = require('path');
const spawn = require('child_process').spawn;
const vscode = require('vscode');
const outputChannel = vscode.window.createOutputChannel("nsL Assembler");

function transpileCommand (textEditor, config) {
  let customArguments, defaultArguments, doc, nsLJar;

  doc = textEditor.document;
  doc.save();

  nslJar = config.nsl.pathToJar;

  if (typeof nslJar === "undefined" || nslJar === null) {
    return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
  }

  defaultArguments = ["-jar", nslJar];
  if (config.nsl.customArguments != null) {
    customArguments = config.nsl.customArguments.trim().split(' ');
  } else {
    customArguments = [ '/nomake', '/nopause' ];
  }
  customArguments.push(doc.fileName);
  const compilerArguments = defaultArguments.concat(customArguments);

  if (config.alwaysShowOutput === true) {
    outputChannel.show(true);
  }
  
  // Let's build
  const nslCmd = spawn("java", compilerArguments);

  let stdErr;

  nslCmd.stdout.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  nslCmd.stderr.on('data', (data) => {
    stdErr += "\n" + data;
    outputChannel.appendLine(data);
  });

  nslCmd.on('close', (code) => {
    if (stdErr.length === 0) {
      if (config.showNotifications) vscode.window.showInformationMessage("Successfully transpiled \"" + doc.fileName + "\"").then((choice) => {
          outputChannel.dispose();
      });
    } else {
      outputChannel.show(true);
      if (config.showNotifications) vscode.window.showErrorMessage("Transpile failed, see output for details").then((choice) => {
          outputChannel.dispose();
      });
    }
  });
}

module.exports = transpileCommand;
