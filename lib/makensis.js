'use babel';

const path = require('path');
const os = require('os');
const spawn = require('child_process').spawn;
const vscode = require('vscode');

function buildCommand (textEditor, config, strictMode) {
  let compilerArguments, doc, outputChannel, pathToMakensis;

  doc = textEditor.document;
  doc.save();

  pathToMakensis = config.pathToMakensis;
  prefix = getDefaultPrefix();

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

  outputChannel = vscode.window.createOutputChannel(path.basename(doc.fileName));
  if (config.alwaysShowOutput === true) {
    outputChannel.show();
  }
 
  // Let's build
  const makensis = spawn(pathToMakensis, compilerArguments);

  makensis.stdout.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  makensis.stderr.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  makensis.on('close', (code) => {
    if (code === 0) {
      if (config.showNotifications) vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"")
        .then((choice) => {
            outputChannel.dispose();
        });
    } else {
      outputChannel.show(true);
      if (config.showNotifications) vscode.window.showErrorMessage("Compilation failed, see output for details")
        .then((choice) => {
            outputChannel.dispose();
        });
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
