'use strict';

import { window } from 'vscode';

import { getConfig } from './util';
import { spawn } from 'child_process';

const outputChannel = window.createOutputChannel('nsL Assembler');

export function transpileNsl(textEditor: any) {
  let config: any = getConfig();
  let doc = textEditor.document;

  doc.save().then(function () {
    let nslJar = config.nsl.pathToJar;

    if (typeof nslJar === 'undefined' || nslJar === null) {
      return window.showErrorMessage('No valid `nsL.jar` was specified in your config');
    }


    let customArguments;
    const defaultArguments = ['-jar', nslJar];
    if (typeof config.nsl.customArguments !== 'undefined' && config.nsl.customArguments !== null) {
      customArguments = config.nsl.customArguments.trim().split(' ');
    } else {
      customArguments = [ '/nomake', '/nopause' ];
    }
    customArguments.push(doc.fileName);
    const compilerArguments = defaultArguments.concat(customArguments);

    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show(true);
    }

    // Let's build
    const nslCmd = spawn('java', compilerArguments);

    let stdErr: string = '';

    nslCmd.stdout.on('data', (data: Array<any>) => {
      outputChannel.appendLine(data.toString());
    });

    nslCmd.stderr.on('data', (data: Array<any>) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    nslCmd.on('close', (code) => {
      if (stdErr.length === 0) {
        if (config.showNotifications) window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`);
      } else {
        outputChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Transpile failed, see output for details');
        console.error(stdErr);
      }
    });
  });
}
