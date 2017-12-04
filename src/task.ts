'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';

import { mkdir, writeFile } from 'fs';
import { getConfig, getPrefix } from './util';
import { join } from 'path';

const createTask = () => {
  if (typeof workspace.rootPath === 'undefined' || workspace.rootPath === null) {
    return window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
  }

  let args, argsStrict;

  let prefix: string = getPrefix();
  let config: WorkspaceConfiguration = getConfig();
  let command = config.pathToMakensis || 'makensis';

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

  const { version } = require('../package.json');

  let taskFile = {
      'command': command,
      'version': version,
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
          'args': argsStrict,
          'isBuildCommand': true
        }
      ]
  };

  let jsonString = JSON.stringify(taskFile, null, 2);
  let dotFolder = join(workspace.rootPath, '/.vscode');
  let buildFile = join(dotFolder, 'tasks.json');

  mkdir(dotFolder, (error) => {
    // ignore errors for now
    writeFile(buildFile, jsonString, (error) => {
      if (error) {
        window.showErrorMessage(error.toString());
      }
      if (config.alwaysOpenBuildTask === false) return;

      // Open tasks.json
      workspace.openTextDocument(buildFile).then( (doc) => {
          window.showTextDocument(doc);
      });
    });
  });
};

export { createTask };
