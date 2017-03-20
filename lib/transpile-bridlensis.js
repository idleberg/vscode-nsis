'use strict';

const vscode = require('vscode');

const outputChannel = vscode.window.createOutputChannel('BridleNSIS');
const spawn = require('child_process').spawn;

module.exports = {
  transpile: (textEditor) => {
    let config, customArguments, defaultArguments, doc;

    config = vscode.workspace.getConfiguration('nsis');

    doc = textEditor.document;
    doc.save().then(function () {
      let bridleJar = config.bridlensis.pathToJar;

      if (typeof bridleJar === 'undefined' || bridleJar === null) {
        return vscode.window.showErrorMessage('No valid `BridleNSIS.jar` was specified in your config');
      }

      defaultArguments = ['-jar', bridleJar];
      if (typeof config.bridlensis.customArguments !== 'undefined' && config.bridlensis.customArguments !== null) {
        customArguments = config.bridlensis.customArguments.trim().split(' ');
      } else {
        customArguments = [];
      }

      if (config.bridlensis.nsisHome.length > 0 && customArguments.indexOf('-n') === -1) {
        customArguments.push('-n');
        customArguments.push(config.bridlensis.nsisHome);
      }

      customArguments.push(doc.fileName);
      const compilerArguments = defaultArguments.concat(customArguments);

      outputChannel.clear();
      if (config.alwaysShowOutput === true) {
        outputChannel.show(true);
      }
      
      // Let's build
      const bridleCmd = spawn('java', compilerArguments);

      let stdErr = '';

      bridleCmd.stdout.on('data', (data) => {
        if (data.indexOf('Cannot run program') !== -1) {
          stdErr += '\n' + data;
        }
        outputChannel.appendLine(data);
      });

      bridleCmd.stderr.on('data', (data) => {
        stdErr += '\n' + data;
        outputChannel.appendLine(data);
      });

      bridleCmd.on('close', (code) => {
        if (code === 0 && stdErr.length === 0) {
          if (config.showNotifications) vscode.window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`);
        } else {
          outputChannel.show(true);
          if (config.showNotifications) vscode.window.showErrorMessage('Transpile failed, see output for details');
          console.error(stdErr);
        }
      });
    });
  }
}
