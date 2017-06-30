'use strict';

import { window, workspace } from 'vscode';

import { platform } from 'os';
import { spawn } from 'child_process';

const getConfig = () => {
  return workspace.getConfiguration('nsis');
};

const makeNsis = () => {
  return new Promise((resolve, reject) => {

    let pathToMakensis = getConfig().pathToMakensis;
    if (typeof pathToMakensis !== 'undefined' && pathToMakensis !== null) {
      return resolve(pathToMakensis);
    }

    let which = spawn(this.which(), ['makensis']);

    which.stdout.on('data', (data) => {
      return resolve(data);
    });

    which.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
    });
  });
};

const getPrefix = () => {
  if (platform() === 'win32') {
    return '/';
  }

  return '-';
};

const which = () => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
};

const clearOutput = (channel) => {
  let config: any = getConfig();

  channel.clear();
  if (config.alwaysShowOutput === true) {
    channel.show(true);
  }
}

const sanitize = (response: Object) => {
  return response.toString().trim();
}

export { clearOutput, getConfig, getPrefix, makeNsis, sanitize, which };
