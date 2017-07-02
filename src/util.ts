'use strict';

import { window, workspace } from 'vscode';

import * as opn from 'opn';
import { basename, dirname, extname, join } from 'path';
import { existsSync } from 'fs';
import { platform } from 'os';
import { spawn, spawnSync } from 'child_process';

const clearOutput = (channel) => {
  let config: any = getConfig();

  channel.clear();
  if (config.alwaysShowOutput === true) {
    channel.show(true);
  }
};

const detectOutfile = (line) => {
  if (line.indexOf('Output: "') === 1) {
    let regex = /Output: \"(.*)\"\r?\n/g;
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

const getConfig = () => {
  return workspace.getConfiguration('nsis');
};

const getPrefix = () => {
  if (platform() === 'win32') {
    return '/';
  }

  return '-';
};

const isWindowsCompatible = () => {
  let config: any = getConfig();

  if (platform() === 'win32' || config.useWineToRun === true) {
    return true;
  }

  return false;
};

const makeNsis = () => {
  return new Promise((resolve, reject) => {
    let pathToMakensis = getConfig().pathToMakensis;
    if (typeof pathToMakensis !== 'undefined' && pathToMakensis !== null) {
      console.log('Using makensis path found in user settings:' + pathToMakensis);
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

const pathWarning = () => {
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

const runInstaller = (outFile) => {
  if (platform() === 'win32') {
    return spawnSync(outFile);
  }

  return spawnSync('wine', [ outFile ]);
};

const sanitize = (response: Object) => {
  return response.toString().trim();
};

const successBridleNsis = (choice) => {
  let doc = window.activeTextEditor.document;

  if (choice === 'Open') {
    let dirName = dirname(doc.fileName);
    let extName = extname(doc.fileName);
    let baseName = basename(doc.fileName, extName);
    let outExt = (extName === '.nsh') ? '.bnsh' : '.bnsi';
    let outName = baseName + outExt;
    let nsisFile = join(dirName, outName);

    workspace.openTextDocument(nsisFile)
    .then( (doc) => {
      window.showTextDocument(doc);
    });
  }
};

const successNslAssembler = (choice) => {
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

const which = () => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
};

export {
  clearOutput,
  detectOutfile,
  getConfig,
  getPrefix,
  isWindowsCompatible,
  makeNsis,
  pathWarning,
  runInstaller,
  sanitize,
  successBridleNsis,
  successNslAssembler,
  which
};
