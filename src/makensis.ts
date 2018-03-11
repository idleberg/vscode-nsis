'use strict';

import { window, WorkspaceConfiguration } from 'vscode';

import * as makensis from 'makensis';
import { platform } from 'os';
import { spawn } from 'child_process';

import {
  clearOutput,
  detectOutfile,
  getConfig,
  getMakensisPath,
  getPrefix,
  isWindowsCompatible,
  openURL,
  pathWarning,
  revealInstaller,
  runInstaller,
  sanitize,
  successNsis
} from './util';

const nsisChannel = window.createOutputChannel('NSIS');

const compile = (strictMode: boolean): void => {
  clearOutput(nsisChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    getMakensisPath()
    .then(sanitize)
    .then( (pathToMakensis: string) => {
      let prefix: string = getPrefix();
      let config: WorkspaceConfiguration = getConfig();

      let compilerArguments: Array<string>;
      if (typeof config.compilerArguments !== 'undefined' && config.compilerArguments !== null) {
        compilerArguments = config.compilerArguments.trim().split(' ');
      } else {
        // no default value, since prefixes are OS dependent
        compilerArguments = [ `${prefix}V4` ];
      }

      // only add WX flag if not already specified
      if (strictMode === true && compilerArguments.indexOf(prefix + 'WX') === -1) {
        compilerArguments.push(`${prefix}WX`);
      }
      compilerArguments.push(doc.fileName);

      // Let's build
      const child = spawn(pathToMakensis, compilerArguments);

      let stdErr: string = '';
      let outFile: string = '';
      let hasWarning: boolean = false;

      child.stdout.on('data', (line: Array<string> ) => {
        // Detect warnings
        if (line.indexOf('warning: ') !== -1) {
          hasWarning = true;
        }
        if (outFile === '') {
          outFile = detectOutfile(line);
        }

        nsisChannel.appendLine(line.toString());
      });

      child.stderr.on('data', (line: Array<any>) => {
        stdErr += '\n' + line;
        nsisChannel.appendLine(line.toString());
      });

      child.on('close', (code) => {
        const openButton = (isWindowsCompatible() === true && outFile !== '') ? 'Run' : null;
        const revealButton = (platform() === 'darwin' || platform() === 'win32') ? 'Reveal' : null;

        if (code === 0) {
          if (hasWarning === true) {
            if (config.showNotifications) {
              window.showWarningMessage(`Compiled with warnings -- ${doc.fileName}`, openButton, revealButton)
              .then((choice) => {
                successNsis(choice, outFile);
              });
            }
            if (stdErr.length > 0) console.warn(stdErr);
          } else {
            if (config.showNotifications) {
              window.showInformationMessage(`Compiled successfully -- ${doc.fileName}`, openButton, revealButton)
              .then((choice) => {
                successNsis(choice, outFile);
              });
            }
          }
        } else {
          nsisChannel.show(true);
          if (config.showNotifications) window.showErrorMessage('Compilation failed, see output for details');
          if (stdErr.length > 0) console.error(stdErr);
        }
      });
    })
    .catch(pathWarning);
  });
};

const printFlags = (output: string, showFlagsAsObject: boolean = true): void => {
  if (showFlagsAsObject === true) {
    nsisChannel.append(JSON.stringify(output, null, 2));
  } else {
    nsisChannel.append(output);
  }
};

const showVersion = (): void => {
  let config: WorkspaceConfiguration = getConfig();

  clearOutput(nsisChannel);

  getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.version({pathToMakensis: pathToMakensis})
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
  .catch(pathWarning);
};

const showCompilerFlags = (): void => {
  let config: WorkspaceConfiguration = getConfig();

  clearOutput(nsisChannel);

  getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.hdrInfo({pathToMakensis: pathToMakensis, json: config.showFlagsAsObject})
    .then(output => {
      printFlags(output.stdout, config.showFlagsAsObject);
    }).catch(output => {
      // fallback for legacy NSIS
      printFlags(output.stdout, config.showFlagsAsObject);
    });
  })
  .catch(pathWarning);
};

const showHelp = (): void => {
  let config: WorkspaceConfiguration = getConfig();

  clearOutput(nsisChannel);

  getMakensisPath()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.cmdHelp('', {pathToMakensis: pathToMakensis, json: config.showFlagsAsObject})
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
  .catch(pathWarning);
};

export { compile, showVersion, showCompilerFlags, showHelp };
