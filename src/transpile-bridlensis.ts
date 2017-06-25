'use strict';

import { window } from 'vscode';

import { getConfig } from './util';
import { spawn } from 'child_process';

const outputChannel = window.createOutputChannel('BridleNSIS');

export function transpileBridle(textEditor: any) {
  let config: any = getConfig();
  let doc = textEditor.document;

  doc.save().then(function () {
    let bridleJar = config.bridlensis.pathToJar;

    if (typeof bridleJar === 'undefined' || bridleJar === null) {
      return window.showErrorMessage('No valid `BridleNSIS.jar` was specified in your config');
    }

    let customArguments;
    const defaultArguments = ['-jar', bridleJar];
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

    let stdErr: string = '';

    bridleCmd.stdout.on('data', (data: Array<any>) => {
      if (data.indexOf('Cannot run program') !== -1) {
        stdErr += '\n' + data;
      }
      outputChannel.appendLine(data.toString());
    });

    bridleCmd.stderr.on('data', (data: Array<any>) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    bridleCmd.on('close', (code) => {
      if (code === 0 && stdErr.length === 0) {
        if (config.showNotifications) window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`);
      } else {
        outputChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Transpile failed, see output for details');
        console.error(stdErr);
      }
    });
  });
}
