'use babel';

const vscode = require('vscode');

const os = require('os');
const spawn = require('child_process').spawn;
const outputChannel = vscode.window.createOutputChannel("NSIS");

if (os.platform() === 'win32') {
  prefix = "/";
} else {
  prefix = "-";
}

function buildCommand (textEditor, strictMode) {
  let compilerArguments, config, doc, pathToMakensis;

  config = vscode.workspace.getConfiguration('nsis');

  doc = textEditor.document;
  doc.save();

  pathToMakensis = config.pathToMakensis;

  if (config.compilerArguments != null) {
    compilerArguments = config.compilerArguments.trim().split(' ');
  } else {
    compilerArguments = [ `${prefix}V4` ];
  }

  // only add WX flag if not already specified
  if (strictMode === true && compilerArguments.indexOf(prefix + "WX") === -1) {
    compilerArguments.push(`${prefix}WX`);
  }
  compilerArguments.push(doc.fileName);

  outputChannel.clear();
  if (config.alwaysShowOutput === true) {
    outputChannel.show();
  }
 
  // Let's build
  const makensis = spawn(pathToMakensis, compilerArguments);

  let stdErr = "";
  let hasWarning = false;

  makensis.stdout.on('data', (data) => {
    if (data.toString().startsWith("warning: ")) {
      hasWarning = true;
    }
    stdErr += "\n" + data;
    outputChannel.appendLine(data);
  });

  makensis.stderr.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  makensis.on('close', (code) => {
    if (code === 0) {
      if (hasWarning === true) {
        if (config.showNotifications) vscode.window.showWarningMessage(`Compiled with warnings -- ${doc.fileName}`);
        console.warn(stdErr);
      } else {
        if (config.showNotifications) vscode.window.showInformationMessage(`Compiled successfully -- ${doc.fileName}`);
      }
    } else {
      outputChannel.show(true);
      if (config.showNotifications) vscode.window.showErrorMessage("Compilation failed, see output for details");
      console.error(stdErr);
    }
  });
}

module.exports = buildCommand;
