import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { fileExists, getMakensisPath, isWindowsCompatible, buttonHandler } from './util';
import nsisChannel from './channel';
import vscode from 'vscode';

async function compilerOutputHandler(data: unknown): Promise<void> {
  const { showOutputView } = await getConfig('nsis');

  nsisChannel.appendLine(data['line']);

  if (showOutputView === 'Always') {
    nsisChannel.show();
  }
}

async function compilerErrorHandler(data: unknown): Promise<void> {
  const { showOutputView } = await getConfig('nsis');

  nsisChannel.appendLine(data['line']);

  if (showOutputView === 'On Errors') {
    nsisChannel.show();
  }
}

async function compilerExitHandler(data: unknown): Promise<void> {
  const { showNotifications, showOutputView } = await getConfig('nsis');

  if (data['status'] === 0) {
    if (showOutputView === 'Always') {
      nsisChannel.show();
    }

    const outfileExists = await fileExists(data['outFile']);

    const openButton = (await isWindowsCompatible() === true && data['outFile']?.length && outfileExists)
      ? 'Run'
      : undefined;

    const revealButton = (outfileExists && ['win32', 'darwin', 'linux'].includes(platform()))
      ? 'Reveal'
      : undefined;

    if (data['warnings'] && showNotifications) {
      if (showOutputView === 'On Warnings & Errors') {
        nsisChannel.show();
      }

      const choice = await vscode.window.showWarningMessage(`Compiled with warnings`, openButton, revealButton);
      await buttonHandler(choice, data['outFile']);
    } else if (showNotifications) {
      const choice = await vscode.window.showInformationMessage(`Compiled successfully`, openButton, revealButton);
      await buttonHandler(choice, data['outFile']);
    }
  } else if (showNotifications) {
    if (showOutputView !== 'Never') {
      nsisChannel.show();
    }

    if (showNotifications) {
      await vscode.window.showErrorMessage('Compilation failed, see output for details');
    }

    if (data['stderr']?.length) {
      console.error(data['stderr']);
    }
  }
}

async function flagsHandler(data: unknown): Promise<void> {
  const { showFlagsAsObject } = await getConfig('nsis');

  const output = data['stdout'] || data['stderr'];
  const message = (showFlagsAsObject
    ? JSON.stringify(output, null, 2)
    : output
  );

  nsisChannel.append(message);
}

async function versionHandler(data: unknown): Promise<void> {
  const { showVersionAsInfoMessage } = await getConfig('nsis');
  const pathToMakensis = await getMakensisPath();

  const output = data['stdout'] || data['stderr'];
  const message = `makensis ${output} (${pathToMakensis})`;

  if (showVersionAsInfoMessage === true) {
    vscode.window.showInformationMessage(message);
  } else {
    nsisChannel.append(message);
  }
}

export {
  compilerOutputHandler,
  compilerErrorHandler,
  compilerExitHandler,
  flagsHandler,
  versionHandler
};
