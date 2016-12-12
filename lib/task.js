'use babel';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require('vscode');

const meta = require('../package.json');

if (os.platform() === 'win32') {
  prefix = "/";
} else {
  prefix = "-";
}

function createTaskCommand (textEditor) {
  let buildFilePath, jsonString, taskFile

  taskFile = {
      "version": meta.version,
      "command": "makensis",
      "args": [ prefix + "V4" ],
      "isShellCommand": false,
      "showOutput": "always",
      "suppressTaskName": true,
      "echoCommand": false,
      "tasks": [
        {
          "taskName": "Build",
          "args": [ "${file}" ],
          "isBuildCommand": true
        },
        {
          "taskName": "Build (strict)",
          "args": [ prefix + "WX", "${file}" ]
        }
      ]
  }

  jsonString = JSON.stringify(taskFile, null, 2);
  buildFilePath = path.join(vscode.workspace.rootPath, "/.vscode/tasks.json");

  fs.writeFile(buildFilePath, jsonString, function(error) {
    if (error) {
      return vscode.window.showErrorMessage(error);
    }
    // Open tasks.json
    vscode.workspace.openTextDocument(buildFilePath).then(function (doc) {
        vscode.window.showTextDocument(doc);
    });
  });
}

module.exports = createTaskCommand;
