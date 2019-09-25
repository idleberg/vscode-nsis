'use strict';

import { window, WorkspaceConfiguration } from 'vscode';

import { clearOutput, getConfig, successBridleNsis, successNslAssembler, validateConfig } from './util';
import { spawn } from 'child_process';


const nslChannel = window.createOutputChannel('nsL Assembler');
const bridleChannel = window.createOutputChannel('BridleNSIS');

/*
 *  Requires nsL Assembler
 *  https://sourceforge.net/projects/nslassembler/
 *  https://github.com/NSIS-Dev/nsl-assembler
 */
const nslAssembler = (): void => {
  clearOutput(nslChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsl') {
    nslChannel.appendLine('This command is only available for nsL Assembler files');
    return;
  }

  let config: WorkspaceConfiguration = getConfig();
  let doc = window.activeTextEditor.document;

  if (config.nsl.customArguments.length) {
    validateConfig(config.nsl.customArguments);
  }

  doc.save().then( () => {
    let nslJar = config.nsl.pathToJar;

    if (typeof nslJar === 'undefined' || nslJar === null) {
      return window.showErrorMessage('No valid `nsL.jar` was specified in your config');
    }

    const defaultArguments: Array<string> = ['-jar', nslJar];
    const customArguments = config.nsl.customArguments;
    const compilerArguments = [ ...defaultArguments, ...customArguments, doc.fileName ];

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
const bridleNsis = (): void => {
  clearOutput(bridleChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'bridlensis') {
    bridleChannel.appendLine('This command is only available for BridleNSIS files');
    return;
  }

  let config: WorkspaceConfiguration = getConfig();
  let doc = window.activeTextEditor.document;

  if (config.bridlensis.customArguments.length) {
    validateConfig(config.bridlensis.customArguments);
  }

  doc.save().then( () => {
    let bridleJar = config.bridlensis.pathToJar;

    if (typeof bridleJar === 'undefined' || bridleJar === null) {
      return window.showErrorMessage('No valid `BridleNSIS.jar` was specified in your config');
    }

    const defaultArguments: Array<string> = ['-jar', bridleJar];
    const customArguments = config.bridlensis.customArguments;


    if (config.bridlensis.nsisHome.length > 0 && !customArguments.includes('-n')) {
      customArguments.push('-n');
      customArguments.push(config.bridlensis.nsisHome);
    }

    const compilerArguments = [ ...defaultArguments, ...customArguments, doc.fileName ];

    // Let's build
    const bridleCmd = spawn('java', compilerArguments);

    let stdErr: string = '';
    let hasError: boolean = false;

    bridleCmd.stdout.on('data', (line: Array<any>) => {
      if (line.includes('Exit Code:')) {
        hasError = true;
      }
      bridleChannel.appendLine(line.toString());
    });

    bridleCmd.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      bridleChannel.appendLine(line.toString());
    });

    bridleCmd.on('close', (code) => {
      if (code === 0 && stdErr.length === 0 && hasError === false) {
        if (config.showNotifications) {
          window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`, 'Open')
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
