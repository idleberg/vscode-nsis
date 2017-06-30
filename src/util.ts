'use strict';

import { window, workspace } from 'vscode';

import * as opn from 'opn';
import { platform } from 'os';
import { spawn } from 'child_process';

const clearOutput = (channel) => {
  let config: any = getConfig();

  channel.clear();
  if (config.alwaysShowOutput === true) {
    channel.show(true);
  }
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

const makeNsis = () => {
  return new Promise((resolve, reject) => {
    let pathToMakensis = getConfig().pathToMakensis;
    if (typeof pathToMakensis !== 'undefined' && pathToMakensis !== null) {
      console.log('Using makensis path found in user settings (' + pathToMakensis + ')');
      return resolve(pathToMakensis);
    }

    let which = spawn(this.which(), ['makensis']);

    which.stdout.on('data', (data) => {
      console.log('Using makensis path detected on file system (' + data + ')');
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

const sanitize = (response: Object) => {
  return  response.toString().trim();
};

const which = () => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
};

export { clearOutput, getConfig, getPrefix, makeNsis, pathWarning, sanitize, which };
