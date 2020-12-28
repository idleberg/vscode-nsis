import { getConfig } from 'vscode-get-config';
import { getPrefix } from './util';
import { join } from 'path';
import { promises as fs } from 'fs';
import vscode from 'vscode';

async function createTask(): Promise<unknown> {
  if (!vscode.workspace.workspaceFolders) {
    return vscode.window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
  }

  const { alwaysOpenBuildTask, compilerVerbosity } = await getConfig('nsis');
  const prefix = getPrefix();

  const taskFile = {
    'version': '2.0.0',
    'tasks': [
      {
        'label': 'Build',
        'type': 'shell',
        'command': 'makensis',
        'args': [
          '${file}',
          `${prefix}V${compilerVerbosity}`,
        ],
        'group': 'build'
      },
      {
        'label': 'Build (strict)',
        'type': 'shell',
        'command': 'makensis',
        'args': [
          '${file}',
          `${prefix}V${compilerVerbosity}`,
          `${prefix}WX`
        ],
        'group': 'build'
      }
    ]
  };

  const jsonString = JSON.stringify(taskFile, null, 2);
  const dotFolder = join(vscode.workspace.workspaceFolders[0].uri.fsPath, '/.vscode');
  const buildFile = join(dotFolder, 'tasks.json');

  try {
    await fs.mkdir(dotFolder);
  } catch (error) {
    console.warn(error);
  }

  // ignore errors for now
  try {
    await fs.writeFile(buildFile, jsonString);

  } catch(error) {
    vscode.window.showErrorMessage(error.toString());
  }

  if (alwaysOpenBuildTask === false) return;

  // Open tasks.json
  const doc = await vscode.workspace.openTextDocument(buildFile)
  vscode.window.showTextDocument(doc);
}

export { createTask };
