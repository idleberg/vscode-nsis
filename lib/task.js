'use babel';

const vscode = require('vscode');

const fs = require('fs');
const os = require('os');
const path = require('path');

const meta = require('../package.json');

if (os.platform() === 'win32') {
  prefix = "/";
} else {
  prefix = "-";
}

function createTaskCommand (textEditor) {
  if (typeof vscode.workspace.rootPath === 'undefined' || vscode.workspace.rootPath === null) {
    return vscode.window.showErrorMessage("Task support is only available when working on a workspace folder. It is not available when editing single files.");
  }

  let buildFile, config, dotFolder, jsonString, taskFile;

  config = vscode.workspace.getConfiguration('nsis');

  taskFile = {
      'version': meta.version,
      'command': 'makensis',
      'args': [ prefix + 'V4' ],
      'isShellCommand': false,
      'showOutput': 'always',
      'suppressTaskName': true,
      'echoCommand': false,
      'tasks': [
        {
          'taskName': 'Build',
          'args': [ '${file}' ],
          'isBuildCommand': true
        },
        {
          'taskName': 'Build (strict)',
          'args': [ prefix + 'WX', '${file}' ]
        }
      ]
  };

  jsonString = JSON.stringify(taskFile, null, 2);
  dotFolder = path.join(vscode.workspace.rootPath, '/.vscode');
  buildFile = path.join(dotFolder, 'tasks.json');

  fs.mkdir(dotFolder, function(error) {
    // ignore errors for now
    fs.writeFile(buildFile, jsonString, function(error) {
      if (error) {
        return vscode.window.showErrorMessage(error);
      }
      if (config.alwaysOpenBuildTask === false) return;

      // Open tasks.json
      vscode.workspace.openTextDocument(buildFile).then(function (doc) {
          vscode.window.showTextDocument(doc);
      });
    });
  });
}

module.exports = createTaskCommand;
