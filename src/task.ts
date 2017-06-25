'use strict';

import { window, workspace} from 'vscode';

import { mkdir, writeFile } from 'fs';
import { getConfig, getPrefix } from './util';
import { join } from 'path';

export function createTask() {
  if (typeof workspace.rootPath === 'undefined' || workspace.rootPath === null) {
    return window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
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
      'version': '3.0.0',
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
  dotFolder = join(workspace.rootPath, '/.vscode');
  buildFile = join(dotFolder, 'tasks.json');

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
