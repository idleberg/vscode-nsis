import { window, workspace } from 'vscode';

import { getConfig } from 'vscode-get-config';
import { getPrefix, validateConfig } from './util';
import { join } from 'path';
import { promises as fs } from 'fs';

async function createTask(): Promise<unknown> {
  if (typeof workspace.rootPath === 'undefined' || workspace.rootPath === null) {
    return window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
  }

  let args, argsStrict;

  const prefix: string = getPrefix();
  const { alwaysOpenBuildTask, compilerArguments } = await getConfig('nsis');

  if (compilerArguments.length) {
    validateConfig(compilerArguments);
    args = compilerArguments;
    argsStrict = compilerArguments;
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

  await fs.mkdir(dotFolder);

    // ignore errors for now
    try {
      await fs.writeFile(buildFile, jsonString);

    } catch(error) {
      window.showErrorMessage(error.toString());
    }

    if (alwaysOpenBuildTask === false) return;

    // Open tasks.json
    workspace.openTextDocument(buildFile).then(doc => {
        window.showTextDocument(doc);
    });
}

export { createTask };
