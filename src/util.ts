'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';

import * as opn from 'opn';
import { basename, dirname, extname, join } from 'path';
import { existsSync } from 'fs';
import { platform } from 'os';
import { spawn } from 'child_process';

const clearOutput = (channel): void => {
  let config: WorkspaceConfiguration = getConfig();

  channel.clear();
  if (config.alwaysShowOutput === true) {
    channel.show(true);
  }
};

const detectOutfile = (line): string => {
  if (line.indexOf('Output: "') !== -1) {
    let regex = /Output: \"(.*\.exe)\"\r?\n/g;
    let result = regex.exec(line.toString());
    if (typeof result === 'object') {
      try {
        return (existsSync(result['1']) === true) ? result['1'] : '';
      } catch (e) {
        return '';
      }
    }
  }

  return '';
};

const getConfig = (): WorkspaceConfiguration => {
  return workspace.getConfiguration('nsis');
};

const getPrefix = (): string => {
  if (platform() === 'win32') {
    return '/';
  }

  return '-';
};

const isWindowsCompatible = (): boolean => {
  let config: WorkspaceConfiguration = getConfig();

  if (platform() === 'win32' || config.useWineToRun === true) {
    return true;
  }

  return false;
};

const getMakensis = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let pathToMakensis: string = getConfig().pathToMakensis;

    if (typeof pathToMakensis !== 'undefined' && pathToMakensis !== null) {
      console.log('Using makensis path found in user settings: ' + pathToMakensis);
      return resolve(pathToMakensis);
    }

    let which = spawn(this.which(), ['makensis']);

    which.stdout.on('data', (data) => {
      console.log('Using makensis path detected on file system: ' + data);
      return resolve(data);
    });

    which.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
    });
  });
};

const pathWarning = (): any => {
  window.showWarningMessage('makensis is not installed or missing in your PATH environmental variable', 'Download', 'Help')
  .then((choice) => {
    switch (choice) {
      case 'Download':
        return opn('https://sourceforge.net/projects/nsis/');
      case 'Help':
        return opn('http://superuser.com/a/284351/195953');
    }
  });
};

const runInstaller = (outFile): void => {
  let config: WorkspaceConfiguration = getConfig();

  if (platform() === 'win32') {
    spawn(outFile);
  } else if (config.useWineToRun === true) {
    spawn('wine', [ outFile ]);
  }
};

const sanitize = (response: Object): string => {
  return response.toString().trim();
};

const successBridleNsis = (choice): void => {
  let doc = window.activeTextEditor.document;

  if (choice === 'Open') {
    let dirName = dirname(doc.fileName);
    let extName = extname(doc.fileName);
    let baseName = basename(doc.fileName, extName);

    // because BridleNSIS is kinda buggy
    let outExt = 'b' + extName.substr(1);

    // if BridleNSIS wasn't buggy
    // let outExt;
    // if (extName == '.nsh') {
    //   outExt = '.bnsh';
    // } else {
    //   outExt = '.bnsi';
    // }

    let outName = baseName + outExt;
    let nsisFile = join(dirName, outName);

    workspace.openTextDocument(nsisFile)
    .then( (doc) => {
      window.showTextDocument(doc);
    });
  }
};

const successNslAssembler = (choice): void => {
  let doc = window.activeTextEditor.document;

  if (choice === 'Open') {
    let dirName = dirname(doc.fileName);
    let extName = extname(doc.fileName);
    let baseName = basename(doc.fileName, extName);
    let outName = baseName + '.nsi';
    let nsisFile = join(dirName, outName);

    workspace.openTextDocument(nsisFile)
    .then( (doc) => {
      window.showTextDocument(doc);
    });
  }
};

const which = (): string => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
};

export {
  clearOutput,
  detectOutfile,
  getConfig,
  getMakensis,
  getPrefix,
  isWindowsCompatible,
  pathWarning,
  runInstaller,
  sanitize,
  successBridleNsis,
  successNslAssembler,
  which
};
