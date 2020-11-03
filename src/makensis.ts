import { commands, window, WorkspaceConfiguration } from 'vscode';

import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { spawn } from 'child_process';
import * as makensis from 'makensis';

import {
  clearOutput,
  detectOutfile,
  fileExists,
  getMakensisPath,
  getPrefix,
  getSpawnEnv,
  isHeaderFile,
  isWindowsCompatible,
  mapDefinitions,
  openURL,
  pathWarning,
  successNsis,
  validateConfig
} from './util';

const nsisChannel = window.createOutputChannel('NSIS');

async function compile(strictMode: boolean): Promise<void> {
  await clearOutput(nsisChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  const { allowHeaderCompilation, compilerArguments, showNotifications } = await getConfig('nsis');
  const document = window.activeTextEditor.document;

  if (!allowHeaderCompilation && isHeaderFile(document.fileName)) {
    const choice = await window.showWarningMessage('Compiling header files is blocked by default. You can allow it in the package settings.', 'Open Settings');
    if (choice === 'Open Settings') {
      commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis allowHeaderCompilation');
      return;
    }
  }

  try {
    await document.save();
  } catch (error) {
    console.error(error);
    window.showErrorMessage('Error saving file, see console for details');
    return;
  }

  let pathToMakensis: string;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error(error);
    pathWarning();

    return;
  }

  const prefix: string = getPrefix();
  let makensisArguments: string[];

  if (compilerArguments.length) {
    validateConfig(compilerArguments);
    makensisArguments = [ ...compilerArguments ];
  } else {
    makensisArguments = [ `${prefix}V4` ];
  }

  // only add WX flag if not already specified
  if (strictMode === true && !makensisArguments.includes(`-WX`) && !makensisArguments.includes(`/WX`)) {
    makensisArguments.push(`${prefix}WX`);
  }

  makensisArguments.push(...mapDefinitions());
  makensisArguments.push(document.fileName);

  // Let's build
  const child = spawn(pathToMakensis, makensisArguments, await getSpawnEnv());

  let stdErr = '';
  let outFile = '';
  let hasWarning = false;

  child.stdout.on('data', async (line: string ) => {
    // Detect warnings
    if (line.includes('warning: ')) {
      hasWarning = true;
    }
    if (outFile === '') {
      outFile = await detectOutfile(line);
    }

    nsisChannel.appendLine(line.toString());
  });

  child.stderr.on('data', (line: string) => {
    stdErr += '\n' + line;
    nsisChannel.appendLine(line.toString());
  });

  child.on('exit', async (code) => {
    if (code === 0) {
      const openButton = (await isWindowsCompatible() === true && outFile?.length && await fileExists(outFile)) ? 'Run' : undefined;
      const revealButton = (await fileExists(outFile) && ['win32', 'darwin', 'linux'].includes(platform())) ? 'Reveal' : undefined;

      if (hasWarning === true) {
        if (showNotifications) {
          const choice = await window.showWarningMessage(`Compiled with warnings`, openButton, revealButton)
          successNsis(choice, outFile);

          return;
        }

        if (stdErr.length > 0) console.warn(stdErr);
      } else {
        if (showNotifications) {
          const choice = await window.showInformationMessage(`Compiled successfully`, openButton, revealButton)
          successNsis(choice, outFile);

          return;
        }
      }
    } else {
      nsisChannel.show(true);
      if (showNotifications) window.showErrorMessage('Compilation failed, see output for details');
      if (stdErr.length > 0) console.error(stdErr);
    }
  });
}

function printFlags(output: string, showFlagsAsObject = true): void {
  if (showFlagsAsObject === true) {
    nsisChannel.append(JSON.stringify(output, null, 2));
  } else {
    nsisChannel.append(output);
  }
}

async function showVersion(): Promise<void> {
  const config: WorkspaceConfiguration = getConfig();

  await clearOutput(nsisChannel);

  let pathToMakensis: string;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error(error);
    pathWarning();

    return;
  }

  try {
    const output = await makensis.version({pathToMakensis: pathToMakensis}, getSpawnEnv());

    if (config.showVersionAsInfoMessage === true) {
      window.showInformationMessage(`makensis ${output.stdout} (${pathToMakensis})`);
    } else {
      nsisChannel.append(`makensis ${output.stdout} (${pathToMakensis})`);
    }
  } catch (error) {
    console.error(error);
  }
}

async function showCompilerFlags(): Promise<void> {
  const { showFlagsAsObject } = await getConfig('nsis');

  await clearOutput(nsisChannel);

  let pathToMakensis;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error(error);
    pathWarning();

    return;
  }

  try {
    const output = await makensis.hdrInfo({pathToMakensis: pathToMakensis, json: showFlagsAsObject}, getSpawnEnv());
    printFlags(output.stdout, showFlagsAsObject);
  } catch (error) {
    console.error(error);
  }
}

async function showHelp(): Promise<void> {
  await clearOutput(nsisChannel);

  let pathToMakensis;

  try {
    pathToMakensis = await getMakensisPath();
  } catch (error) {
    console.error(error);
    pathWarning();

    return;
  }

  try {
    const output = await makensis.cmdHelp('', {pathToMakensis: pathToMakensis, json: true}, getSpawnEnv());

    window.showQuickPick(Object.keys(output.stdout)).then(cmd => {
      if (typeof cmd === 'undefined') {
        return;
      }

      openURL(cmd);
    });
  } catch (output) {
    console.error(output);
  }
}

export { compile, showVersion, showCompilerFlags, showHelp };
