import { compilerOutputHandler, compilerErrorHandler, compilerExitHandler, flagsHandler, versionHandler } from './handlers';
import { getConfig } from 'vscode-get-config';
import { sendTelemetryEvent } from './telemetry';
import * as NSIS from 'makensis';
import { commands, window } from 'vscode';

import {
  getMakensisPath,
  getProjectPath,
  getSpawnEnv,
  isHeaderFile,
  openURL,
  pathWarning
} from './util';
import nsisChannel from './channel';

export async function compile(strictMode: boolean): Promise<void> {
	const activeTextEditor = window?.activeTextEditor;

	if (!activeTextEditor) {
		return;
	}

  const languageID = activeTextEditor['_documentData']
    ? activeTextEditor['_documentData']['_languageId']
    : activeTextEditor['document']['languageId'];

  if (!activeTextEditor || languageID !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  const { compiler, processHeaders, showFlagsAsObject } = await getConfig('nsis');
  const document = activeTextEditor.document;

  if (isHeaderFile(document.fileName)) {
    if (processHeaders === "Disallow") {
      const choice = await window.showWarningMessage('Compiling header files is blocked by default. You can allow it in the package settings, or mute this warning.', 'Open Settings');
      if (choice === 'Open Settings') {
        commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis processHeaders');
        return;
      }
    } else if (processHeaders === "Disallow & Never Ask Me") {
      window.setStatusBarMessage("makensis: Skipped header file", 5000);
      return;
    }
  }

  try {
    await document.save();
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    window.showErrorMessage('Error saving file, see console for details');
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
        verbose: compiler.verbosity
      },
      await getSpawnEnv()
    );
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    hasErrors = true;
  } finally {
    sendTelemetryEvent('compile', {
      strictMode,
      hasErrors
    });
  }

  NSIS.events.removeAllListeners();
}

export async function showVersion(): Promise<void> {
  await nsisChannel.clear();

  NSIS.events.once('exit', versionHandler);

  let hasErrors = false;

  try {
    await NSIS.version(
      {
        events: true,
        pathToMakensis: await getMakensisPath()
      },
      await getSpawnEnv()
    );

  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    hasErrors = true;
  } finally {
    sendTelemetryEvent('showVersion', {
      hasErrors
    });
  }

  NSIS.events.removeAllListeners();
}

export async function showCompilerFlags(): Promise<void> {
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
    sendTelemetryEvent('showCompilerFlags', {
      hasErrors
    });
  }

  NSIS.events.removeAllListeners();
}

export async function showHelp(): Promise<void> {
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
    command = await window.showQuickPick(Object.keys(output.stdout)) || undefined;

    if (command) {
      openURL(command);
    }

  } catch (error) {
    console.error('[vscode-nsis]', error instanceof error ? error.message : error);
    hasErrors = true;
  } finally {
    sendTelemetryEvent('showHelp', {
      command,
      hasErrors
    });
  }

  NSIS.events.removeAllListeners();
}
