'use strict';

import { window } from 'vscode';

import { clearOutput, getConfig, makeNsis, successBridleNsis, successNslAssembler } from './util';
import { spawn } from 'child_process';


const nslChannel = window.createOutputChannel('nsL Assembler');
const bridleChannel = window.createOutputChannel('BridleNSIS');

/*
 *  Requires nsL Assembler
 *  https://sourceforge.net/projects/nslassembler/
 *  https://github.com/NSIS-Dev/nsl-assembler
 */
const nslAssembler = () => {
  clearOutput(nslChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsl') {
    nslChannel.appendLine('This command is only available for nsL Assembler files');
    return;
  }

  let config: any = getConfig();
  let doc = window.activeTextEditor.document;

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

    // Let's build
    const nslCmd = spawn('java', compilerArguments);

    let stdErr: string = '';

    nslCmd.stdout.on('data', (line: Array<any>) => {
      nslChannel.appendLine(line.toString());
    });

    nslCmd.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      nslChannel.appendLine(line.toString());
    });

    nslCmd.on('close', (code) => {
      if (stdErr.length === 0) {
        if (config.showNotifications) {
          window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`, 'Open')
          .then(successNslAssembler);
        }
      } else {
        nslChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Transpile failed, see output for details');
        if (stdErr.length > 0) console.error(stdErr);
      }
    });
  });
};

/*
 *  Requires BridleNSIS
 *  https://github.com/henrikor2/bridlensis
 */
const bridleNsis = () => {
  clearOutput(bridleChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'bridlensis') {
    bridleChannel.appendLine('This command is only available for BridleNSIS files');
    return;
  }

  let config: any = getConfig();
  let doc = window.activeTextEditor.document;

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

    // Let's build
    const bridleCmd = spawn('java', compilerArguments);

    let stdErr: string = '';

    bridleCmd.stdout.on('data', (line: Array<any>) => {
      if (line.indexOf('Cannot run program') !== -1) {
        stdErr += '\n' + line;
      }
      bridleChannel.appendLine(line.toString());
    });

    bridleCmd.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      bridleChannel.appendLine(line.toString());
    });

    bridleCmd.on('close', (code) => {
      if (code === 0 && stdErr.length === 0) {
        if (config.showNotifications) {
          window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`)
          .then(successBridleNsis);
        }
      } else {
        bridleChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Transpile failed, see output for details');
        if (stdErr.length > 0) console.error(stdErr);
      }
    });
  });
};

export {nslAssembler, bridleNsis };
