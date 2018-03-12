'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';

import * as opn from 'opn';
import { basename, dirname, extname, join } from 'path';
import { access, existsSync } from 'fs';
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

const getMakensisPath = (): Promise<any> => {
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

const openURL = (cmd: string): void => {
  opn(`https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/${cmd}.html?utm_source=vscode&utm_content=reference`);
};

const pathWarning = (): any => {
  window.showWarningMessage('makensis is not installed or missing in your PATH environmental variable', 'Download', 'Help')
  .then((choice) => {
    switch (choice) {
      case 'Download':
        opn('https://sourceforge.net/projects/nsis/');
        break;
      case 'Help':
        opn('http://superuser.com/a/284351/195953');
        break;
    }
  });
};

const revealInstaller = (outFile) => {
    return access(outFile, 0, (error) => {
      if (error || outFile === '') {
        return console.error(error);
      }

      switch (platform()) {
        case 'win32':
          spawn('explorer', [`/select,${outFile}`]);
          break;
        case 'darwin':
          spawn('open', ['-R', outFile]);
          break;
        case 'linux':
          try {
            spawn('nautilus', [outFile]);
          } catch (error) {
            console.error(error);
          }
          break;
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

const successNsis = (choice, outFile) => {
  switch (choice) {
    case 'Run':
      runInstaller(outFile);
      break;
    case 'Reveal':
      revealInstaller(outFile);
      break;
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
  getMakensisPath,
  getPrefix,
  isWindowsCompatible,
  openURL,
  pathWarning,
  revealInstaller,
  runInstaller,
  sanitize,
  successBridleNsis,
  successNslAssembler,
  successNsis,
  which
};
