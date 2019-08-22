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

  if (config.compilerArguments.length) {
    args = config.compilerArguments;
    argsStrict = config.compilerArguments;
  } else {
    // no default value, since prefixes are OS dependent
    args = [ `${prefix}V4` ];
    argsStrict = [ `${prefix}V4` ];
  }

  args.push('${file}');

  // only add WX flag if not already specified
  if (!argsStrict.includes('-WX') && !argsStrict.includes('/WX')) {
    argsStrict.push(`${prefix}WX`);
    argsStrict.push('${file}');
  }

  const { version } = require('../package.json');

  const taskFile = {
    'version': '2.0.0',
    'tasks': [
      {
        'label': 'Build',
        'type': 'shell',
        'command': 'makensis',
        'args': args,
        'group': 'build'
      },
      {
        'label': 'Build (strict)',
        'type': 'shell',
        'command': 'makensis',
        'args': argsStrict,
        'group': 'build'
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
