'use babel';

// const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const os = require('os');
const vscode = require('vscode');

function buildCommand (textEditor, config, strictMode) {
  let doc, compilerArguments, pathToMakensis;

  doc = textEditor.document;
  doc.save();

  pathToMakensis = config.pathToMakensis;
  prefix = getDefaultPrefix();

  if (config.compilerArguments != null) {
    compilerArguments = config.compilerArguments.trim().join(" ");
  } else {
    compilerArguments = [`${prefix}V4`];
  }

  // only add WX flag if not already specified
  if (strictMode === true && compilerArguments.indexOf(prefix + "WX") === -1) {
    compilerArguments.push(`${prefix}WX`);
  }
  compilerArguments.push(doc.fileName);

  let outputChannel = vscode.window.createOutputChannel('extension.nsis');
  if (config.alwaysShowOutput === true) {
    outputChannel.show(true);
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
      vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
    } else {
      outputChannel.show(true);
      vscode.window.showErrorMessage("Compilation failed, see output for details");
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
