'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';

import { mkdir, writeFile } from 'fs';
import { getConfig, getPrefix, validateConfig } from './util';
import { join } from 'path';

function createTask() {
  if (typeof workspace.rootPath === 'undefined' || workspace.rootPath === null) {
    return window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
  }

  let args, argsStrict;

  const prefix: string = getPrefix();
  const config: WorkspaceConfiguration = getConfig();
  const command = config.pathToMakensis || 'makensis';

  if (config.compilerArguments.length) {
    validateConfig(config.compilerArguments);
    args = config.compilerArguments;
    argsStrict = config.compilerArguments;
  } else {
    // no default value, since prefixes are OS dependent
    args = [ `${prefix}V4` ];
    argsStrict = [ `${prefix}V4` ];
  }

  // only add WX flag if not already specified
  if (!argsStrict.includes('-WX') && !argsStrict.includes('/WX')) {
    argsStrict.push(`${prefix}WX`);
  }

  args.push('${file}');
  argsStrict.push('${file}');

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

  const jsonString = JSON.stringify(taskFile, null, 2);
  const dotFolder = join(workspace.rootPath, '/.vscode');
  const buildFile = join(dotFolder, 'tasks.json');

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
}

export { createTask };
