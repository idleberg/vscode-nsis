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

  let args, args2, buildFile, command, config, dotFolder, jsonString, taskFile;

  config = vscode.workspace.getConfiguration('nsis');
  command = config.pathToMakensis || 'makensis';

  if (config.compilerArguments !== null) {
    args = config.compilerArguments.trim().split(' ');
    args2 = config.compilerArguments.trim().split(' ');
  } else {
    // no default value, since prefixes are OS dependent
    args = [ `${prefix}V4` ];
    args2 = [ `${prefix}V4` ];
  }

  // only add WX flag if not already specified
  if (args.indexOf(`${prefix}WX`) === -1) {
    args2.push(`${prefix}WX`);
    args2.push('${file}');
  }
  args.push('${file}');

  taskFile = {
      'command': command,
      'version': meta.version,
      'args': [],
      'isShellCommand': false,
      'showOutput': 'always',
      'suppressTaskName': true,
      'echoCommand': false,
      'tasks': [
        {
          'taskName': 'Build',
          'args': args,
          'isBuildCommand': true
        },
        {
          'taskName': 'Build (strict)',
          'args': args2
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
