'use strict';

import { window } from 'vscode';

import { getConfig } from './util';
import { spawn } from 'child_process';

const outputChannel = window.createOutputChannel('nsL Assembler');

/*
 *  Requires nsL Assembler
 *  https://sourceforge.net/projects/nslassembler/
 *  https://github.com/NSIS-Dev/nsl-assembler
 */
let nslAssembler = (textEditor: any) => {
  let config: any = getConfig();
  let doc = textEditor.document;

  doc.save().then( () => {
    let nslJar = config.nsl.pathToJar;

    if (typeof nslJar === 'undefined' || nslJar === null) {
      return window.showErrorMessage('No valid `nsL.jar` was specified in your config');
    }


    let customArguments: Array<string>;
    const defaultArguments: Array<string> = ['-jar', nslJar];
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

    nslCmd.stdout.on('data', (line: Array<any>) => {
      outputChannel.appendLine(line.toString());
    });

    nslCmd.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      outputChannel.appendLine(line.toString());
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

/*
 *  Requires BridleNSIS
 *  https://github.com/henrikor2/bridlensis
 */
let bridleNsis = (textEditor: any) => {
  let config: any = getConfig();
  let doc = textEditor.document;

  doc.save().then( () => {
    let bridleJar = config.bridlensis.pathToJar;

    if (typeof bridleJar === 'undefined' || bridleJar === null) {
      return window.showErrorMessage('No valid `BridleNSIS.jar` was specified in your config');
    }

    let customArguments: Array<string>;
    const defaultArguments: Array<string> = ['-jar', bridleJar];
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

    bridleCmd.stdout.on('data', (line: Array<any>) => {
      if (line.indexOf('Cannot run program') !== -1) {
        stdErr += '\n' + line;
      }
      outputChannel.appendLine(line.toString());
    });

    bridleCmd.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      outputChannel.appendLine(line.toString());
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

export {nslAssembler, bridleNsis };
