'use strict';

import { window, workspace } from 'vscode';

import { platform } from 'os';
import { spawn } from 'child_process';

let getConfig = () => {
  return workspace.getConfiguration('nsis');
}

// let getPath =  (callback) => {
//   let pathToMakensis = getConfig().pathToMakensis;

//   if (pathToMakensis !== 'undefined' && pathToMakensis.length > 0) {
//     return callback(pathToMakensis);
//   }

//   let which;
//   which = spawn(which(), ['makensis']);

//   which.stdout.on('data', (data) => {
//     let path;
//     path = data.toString().trim();
//     return callback(path);
//   });

//   return which.on('close', (errorCode) => {
//     if (errorCode > 0) {
//       return window.showWarningMessage('makensis is not in your `PATH` [environmental variable](http://superuser.com/a/284351/195953)');
//     }
//   });
// }

let getPrefix = () => {
  if (platform() === 'win32') {
    return '/';
  }

  return '-';
}

let which = () => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
}

export { getConfig, getPrefix, which };
