import vscode from 'vscode';
import { getConfig } from 'vscode-get-config';
import { compilerOutputHandler, compilerErrorHandler, compilerExitHandler, flagsHandler, versionHandler } from './handlers';
import NSIS from 'makensis';

import {
  getMakensisPath,
  getSpawnEnv,
  isHeaderFile,
  mapDefinitions,
  openURL,
  pathWarning,
} from './util';
import nsisChannel from './channel';

async function compile(strictMode: boolean): Promise<void> {
  if (vscode.window?.activeTextEditor['_documentData']['_languageId'] !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  const { processHeaders, compilerVerbosity, showFlagsAsObject } = await getConfig('nsis');
  const document = vscode.window.activeTextEditor.document;

  if (!processHeaders && isHeaderFile(document.fileName)) {
    const choice = await vscode.window.showWarningMessage('Compiling header files is blocked by default. You can allow it in the package settings.', 'Open Settings');
    if (choice === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis processHeaders');
      return;
    }
  }

  try {
    await document.save();
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage('Error saving file, see console for details');
    return;
  }

  nsisChannel.clear();

  NSIS.events.on('stdout', compilerOutputHandler);
  NSIS.events.on('stderr', compilerErrorHandler);
  NSIS.events.once('exit', compilerExitHandler);

  await NSIS.compile(
    document.fileName,
    {
      define: mapDefinitions(),
      json: showFlagsAsObject,
      pathToMakensis: await getMakensisPath(),
      strict: strictMode,
      verbose: compilerVerbosity
    },
    await getSpawnEnv()
  );

  NSIS.events.removeAllListeners();
}

async function showVersion(): Promise<void> {
  const pathToMakensis = await getMakensisPath();
  await nsisChannel.clear();

  NSIS.events.once('exit', versionHandler);

  await NSIS.version(
    {
      pathToMakensis: pathToMakensis || undefined
    },
    await getSpawnEnv()
  );
}

async function showCompilerFlags(): Promise<void> {
  const { showFlagsAsObject } = await getConfig('nsis');
  const pathToMakensis = await getMakensisPath();

  await nsisChannel.clear();

  NSIS.events.once('exit', flagsHandler);

  await NSIS.headerInfo(
    {
      json: showFlagsAsObject || false,
      pathToMakensis: pathToMakensis || undefined
    },
    await getSpawnEnv()
  );
}

async function showHelp(): Promise<void> {
  nsisChannel.clear();

  let pathToMakensis;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error(error);
    await pathWarning();

    return;
  }

  try {
    const output = await NSIS.cmdHelp('', {
        pathToMakensis: pathToMakensis,
        json: true
      },
      await getSpawnEnv()
    );
    const cmd = await vscode.window.showQuickPick(Object.keys(output.stdout));

    if (cmd) {
      openURL(cmd);
    }

  } catch (output) {
    console.error(output);
  }
}

export { compile, showVersion, showCompilerFlags, showHelp };
