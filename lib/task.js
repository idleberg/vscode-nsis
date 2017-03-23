'use strict';

const vscode = require('vscode');
const meta = require('../package.json');

const fs = require('fs');
const getConfig = require('./helpers').getConfig;
const getPrefix = require('./helpers').getPrefix;
const path = require('path');

module.exports = {
  create: (textEditor) => {
    if (typeof vscode.workspace.rootPath === 'undefined' || vscode.workspace.rootPath === null) {
      return vscode.window.showErrorMessage("Task support is only available when working on a workspace folder. It is not available when editing single files.");
    }

    let args, argsStrict, buildFile, command, config, dotFolder, jsonString, prefix, taskFile;

    prefix = getPrefix();
    config = getConfig();
    command = config.pathToMakensis || 'makensis';

    if (typeof config.compilerArguments !== 'undefined' && config.compilerArguments !== null) {
      args = config.compilerArguments.trim().split(' ');
      argsStrict = config.compilerArguments.trim().split(' ');
    } else {
      // no default value, since prefixes are OS dependent
      args = [ `${prefix}V4` ];
      argsStrict = [ `${prefix}V4` ];
    }

    // only add WX flag if not already specified
    if (args.indexOf(`${prefix}WX`) === -1) {
      argsStrict.push(`${prefix}WX`);
      argsStrict.push('${file}');
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
            'args': argsStrict
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
          vscode.window.showErrorMessage(error);
        }
        if (config.alwaysOpenBuildTask === false) return;

        // Open tasks.json
        vscode.workspace.openTextDocument(buildFile).then(function (doc) {
            vscode.window.showTextDocument(doc);
        });
      });
    });
  }
}
