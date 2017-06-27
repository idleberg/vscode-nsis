'use strict';

import { window }from 'vscode';

import { getConfig, getPrefix } from './util';
import { spawn } from 'child_process';

const outputChannel = window.createOutputChannel('NSIS');

let compile = (textEditor: any, strictMode: boolean) => {
  let config: any = getConfig();
  let doc = textEditor.document;

  doc.save().then( () => {
    let pathToMakensis: string = config.pathToMakensis;
    let prefix: string = getPrefix();

    let compilerArguments: Array<string>;
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

    makensis.stdout.on('data', (line: Array<string> ) => {
      if (line.indexOf('warning: ') !== -1) {
        hasWarning = true;
      }
      outputChannel.appendLine(line.toString());
    });

    makensis.stderr.on('data', (line: Array<any>) => {
      stdErr += '\n' + line;
      outputChannel.appendLine(line.toString());
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

let showVersion = () => {
  let config: any = getConfig();
  let pathToMakensis: string = config.pathToMakensis;
  let prefix: string = getPrefix();

  const makensis = spawn(pathToMakensis, [ `${prefix}VERSION` ]);

  makensis.stdout.on('data', (version: Array<string> ) => {
    window.showInformationMessage(`makensis ${version} (${pathToMakensis})`);
  });
}

let showCompilerFlags = () => {
  let config: any = getConfig();
  let pathToMakensis: string = config.pathToMakensis;
  let prefix: string = getPrefix();

  outputChannel.clear();
  if (config.alwaysShowOutput === true) {
    outputChannel.show();
  }

  const makensis = spawn(pathToMakensis, [ `${prefix}HDRINFO` ]);

  makensis.stdout.on('data', (flags: Array<string> ) => {
    outputChannel.appendLine(flags.toString());
  });

  makensis.on('close', (code) => {
    if (code === 0) {
      outputChannel.show(true);
    }
  });
}

export { compile, showVersion, showCompilerFlags };
