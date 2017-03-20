'use strict';

const vscode = require('vscode');

const platform = require('os').platform;
const spawn = require('child_process').spawn;

module.exports = {
  getPath: (callback) => {
    let pathToMakensis = vscode.workspace.getConfiguration('nsis').pathToMakensis;

    if (pathToMakensis !== 'undefined' && pathToMakensis.length > 0) {
      return callback(pathToMakensis);
    }

    let which = spawn(module.exports.which(), ['makensis']);

    which.stdout.on('data', function(data) {
      var path;
      path = data.toString().trim();
      return callback(path);
    });

    return which.on('close', function(errorCode) {
      if (errorCode > 0) {
        return vscode.window.showWarningMessage('makensis is not in your `PATH` [environmental variable](http://superuser.com/a/284351/195953)');
      }
    });
  },

  getPrefix: () => {
    if (platform() === 'win32') {
      return '/';
    }

    return '-';
  },

  which: () => {
    if (platform() === 'win32') {
      return 'where';
    }
    return 'which';
  }
}
