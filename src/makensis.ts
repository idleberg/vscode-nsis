'use strict';

import { commands, window, WorkspaceConfiguration } from 'vscode';

import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { spawn } from 'child_process';
import * as makensis from 'makensis';

import {
  clearOutput,
  detectOutfile,
  getMakensisPath,
  getPrefix,
  getSpawnEnv,
  isHeaderFile,
  isWindowsCompatible,
  openURL,
  pathWarning,
  sanitize,
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

  document.save().then(async () => {
    await getMakensisPath()
    .then(sanitize)
    .then( async (pathToMakensis: string) => {
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

      makensisArguments.push(document.fileName);

      // Let's build
      const child = spawn(pathToMakensis, makensisArguments, await getSpawnEnv());

      let stdErr = '';
      let outFile = '';
      let hasWarning = false;

      child.stdout.on('data', (line: string ) => {
        // Detect warnings
        if (line.includes('warning: ')) {
          hasWarning = true;
        }
        if (outFile === '') {
          outFile = detectOutfile(line);
        }

        nsisChannel.appendLine(line.toString());
      });

      child.stderr.on('data', (line: string) => {
        stdErr += '\n' + line;
        nsisChannel.appendLine(line.toString());
      });

      child.on('exit', async (code) => {
        if (code === 0) {
          const openButton = (await isWindowsCompatible() === true && outFile !== '') ? 'Run' : null;
          const revealButton = (platform() === 'win32' || platform() === 'darwin' || platform() === 'linux') ? 'Reveal' : null;

          if (hasWarning === true) {
            if (showNotifications) {
              window.showWarningMessage(`Compiled with warnings -- ${document.fileName}`, openButton, revealButton)
              .then(async choice => {
                await successNsis(choice, outFile);
              });
            }
            if (stdErr.length > 0) console.warn(stdErr);
          } else {
            if (showNotifications) {
              window.showInformationMessage(`Compiled successfully -- ${document.fileName}`, openButton, revealButton)
              .then(async choice => {
                await successNsis(choice, outFile);
              });
            }
          }
        } else {
          nsisChannel.show(true);
          if (showNotifications) window.showErrorMessage('Compilation failed, see output for details');
          if (stdErr.length > 0) console.error(stdErr);
        }
      });
    })
    .catch(error => {
      console.error(error);
      pathWarning();
    });
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

  await getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.version({pathToMakensis: pathToMakensis}, getSpawnEnv())
    .then(output => {
      if (config.showVersionAsInfoMessage === true) {
        window.showInformationMessage(`makensis ${output.stdout} (${pathToMakensis})`);
      } else {
        nsisChannel.append(`makensis ${output.stdout} (${pathToMakensis})`);
      }
    }).catch(error => {
      console.error(error);
    });
  })
  .catch(error => {
    console.error(error);
    pathWarning();
  });
}

async function showCompilerFlags(): Promise<void> {
  const config: WorkspaceConfiguration = getConfig();

  await clearOutput(nsisChannel);

  await getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.hdrInfo({pathToMakensis: pathToMakensis, json: config.showFlagsAsObject}, getSpawnEnv())
    .then(output => {
      printFlags(output.stdout, config.showFlagsAsObject);
    }).catch(output => {
      // fallback for legacy NSIS
      printFlags(output.stdout, config.showFlagsAsObject);
    });
  })
  .catch(error => {
    console.error(error);
    pathWarning();
  });
}

async function showHelp(): Promise<void> {
  const config: WorkspaceConfiguration = getConfig();

  await clearOutput(nsisChannel);

  await getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.cmdHelp('', {pathToMakensis: pathToMakensis, json: config.showFlagsAsObject}, getSpawnEnv())
    .then(output => {
      window.showQuickPick(Object.keys(output.stdout)).then(cmd => {
        if (typeof cmd === 'undefined') {
          return;
        }

        openURL(cmd);
      });
    }).catch(output => {
      // fallback for legacy NSIS
      printFlags(output.stdout, config.showFlagsAsObject);
    });
  })
  .catch(error => {
    console.error(error);
    pathWarning();
  });
}

export { compile, showVersion, showCompilerFlags, showHelp };
