import { compilerOutputHandler, compilerErrorHandler, compilerExitHandler, flagsHandler, versionHandler } from './handlers';
import { getConfig } from 'vscode-get-config';
import { inRange } from './util';
import { trackEvent } from './telemetry';
import * as NSIS from 'makensis';
import vscode from 'vscode';

import {
  getMakensisPath,
  getProjectPath,
  getSpawnEnv,
  isHeaderFile,
  openURL,
  pathWarning,
} from './util';
import nsisChannel from './channel';

async function compile(strictMode: boolean): Promise<void> {
  // TODO Breaking change in VSCode 1.54, remove in future
  const languageID = vscode.window.activeTextEditor['_documentData']
    ? vscode.window.activeTextEditor['_documentData']['_languageId']
    : vscode.window.activeTextEditor['document']['languageId'];

  if (!vscode.window.activeTextEditor || languageID !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  const { compiler, processHeaders, showFlagsAsObject } = await getConfig('nsis');
  const document = vscode.window.activeTextEditor.document;

  if (isHeaderFile(document.fileName)) {
    if (processHeaders === "Disallow") {
      const choice = await vscode.window.showWarningMessage('Compiling header files is blocked by default. You can allow it in the package settings, or mute this warning.', 'Open Settings');
      if (choice === 'Open Settings') {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis processHeaders');
        return;
      }
    } else if (processHeaders === "Disallow & Never Ask Me") {
      vscode.window.setStatusBarMessage("makensis: Skipped header file", 5000);
      return;
    }
  }

  try {
    await document.save();
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    vscode.window.showErrorMessage('Error saving file, see console for details');
    return;
  }

  nsisChannel.clear();

  NSIS.events.on('stdout', async data => await compilerOutputHandler(data));
  NSIS.events.on('stderr', async data => await compilerErrorHandler(data));
  NSIS.events.once('exit', async data => await compilerExitHandler(data));

  let hasErrors = false;

  try {
    await NSIS.compile(
      document.fileName,
      {
        env: await getProjectPath() || false,
        events: true,
        json: showFlagsAsObject,
        pathToMakensis: await getMakensisPath(),
        rawArguments: compiler.customArguments,
        strict: strictMode || compiler.strictMode,
        verbose: inRange(compiler.verbosity, 0, 4) ? Number(compiler.verbosity) : undefined
      },
      await getSpawnEnv()
    );
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    hasErrors = true;
  } finally {
    trackEvent('compile', {
      strictMode,
      hasErrors
  });
  }
  NSIS.events.removeAllListeners();
}

async function showVersion(): Promise<void> {
  const pathToMakensis = await getMakensisPath();
  await nsisChannel.clear();

  NSIS.events.once('exit', versionHandler);

  let hasErrors = false;

  try {
    await NSIS.version(
      {
        events: true,
        pathToMakensis: pathToMakensis || undefined
      },
      await getSpawnEnv()
    );

  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    hasErrors = true;
  } finally {
    trackEvent('showVersion', {
      hasErrors
    });
  }

}

async function showCompilerFlags(): Promise<void> {
  const { showFlagsAsObject } = await getConfig('nsis');
  const pathToMakensis = await getMakensisPath();

  await nsisChannel.clear();

  NSIS.events.once('exit', flagsHandler);

  let hasErrors = false;

  try {
    await NSIS.headerInfo(
      {
        events: true,
        json: showFlagsAsObject || false,
        pathToMakensis: pathToMakensis || undefined
      },
      await getSpawnEnv()
    );
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    hasErrors = true;
  } finally {
    trackEvent('showCompilerFlags', {
      hasErrors
    });
  }

}

async function showHelp(): Promise<void> {
  nsisChannel.clear();

  let pathToMakensis;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    await pathWarning();

    return;
  }

  let hasErrors = false;
  let command: string | undefined = undefined;

  try {
    const output = await NSIS.commandHelp('', {
        pathToMakensis: pathToMakensis,
        json: true
      },
      await getSpawnEnv()
    );
    command = await vscode.window.showQuickPick(Object.keys(output.stdout)) || undefined;

    if (command) {
      openURL(command);
    }

  } catch (error) {
    console.error('[vscode-nsis]', error instanceof error ? error.message : error);
    hasErrors = true;
  } finally {
    trackEvent('showHelp', {
      command,
      hasErrors
    });
  }
}

export { compile, showVersion, showCompilerFlags, showHelp };
