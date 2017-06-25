'use strict';

import { window }from 'vscode';

import { getConfig, getPrefix } from './util';
import { spawn } from 'child_process';

const outputChannel = window.createOutputChannel('NSIS');

export function compile(textEditor: any, strictMode: boolean) {
  let config: any = getConfig();

  let doc = textEditor.document;
  doc.save().then(function () {
    let pathToMakensis = config.pathToMakensis;
    let prefix = getPrefix();

    let compilerArguments;
    if (typeof config.compilerArguments !== 'undefined' && config.compilerArguments !== null) {
      compilerArguments = config.compilerArguments.trim().split(' ');
    } else {
      // no default value, since prefixes are OS dependent
      compilerArguments = [ `${prefix}V4` ];
    }

    // only add WX flag if not already specified
    if (strictMode === true && compilerArguments.indexOf(prefix + 'WX') === -1) {
      compilerArguments.push(`${prefix}WX`);
    }
    compilerArguments.push(doc.fileName);

    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show();
    }

    // Let's build
    const makensis = spawn(pathToMakensis, compilerArguments);

    let stdErr: string = '';
    let hasWarning: boolean = false;

    makensis.stdout.on('data', (data: Array<string> ) => {
      console.log(typeof data);
      if (data.indexOf('warning: ') !== -1) {
        hasWarning = true;
      }
      outputChannel.appendLine(data.toString());
    });

    makensis.stderr.on('data', (data: Array<any>) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    makensis.on('close', (code) => {
      if (code === 0) {
        if (hasWarning === true) {
          if (config.showNotifications) window.showWarningMessage(`Compiled with warnings -- ${doc.fileName}`);
          console.warn(stdErr);
        } else {
          if (config.showNotifications) window.showInformationMessage(`Compiled successfully -- ${doc.fileName}`);
        }
      } else {
        outputChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Compilation failed, see output for details');
        console.error(stdErr);
      }
    });
  });
}
