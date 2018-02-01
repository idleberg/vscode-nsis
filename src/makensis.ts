'use strict';

import { window, WorkspaceConfiguration } from 'vscode';

import * as makensis from 'makensis';
import { clearOutput, detectOutfile, getConfig, getMakensis, getPrefix, isWindowsCompatible, pathWarning, runInstaller, sanitize } from './util';
import { platform } from 'os';
import { spawn } from 'child_process';

const nsisChannel = window.createOutputChannel('NSIS');

const compile = (strictMode: boolean): void => {
  clearOutput(nsisChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    getMakensis()
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
        if (isWindowsCompatible() === true && outFile === '') {
          outFile = detectOutfile(line);
        }

        nsisChannel.appendLine(line.toString());
      });

      child.stderr.on('data', (line: Array<any>) => {
        stdErr += '\n' + line;
        nsisChannel.appendLine(line.toString());
      });

      child.on('close', (code) => {
        let openButton = (isWindowsCompatible() === true && outFile !== '') ? 'Run' : null;
        if (code === 0) {
          if (hasWarning === true) {
            if (config.showNotifications) {
              window.showWarningMessage(`Compiled with warnings -- ${doc.fileName}`, openButton)
              .then((choice) => {
                if (choice === 'Run') {
                  runInstaller(outFile);
                }
              });
            }
            if (stdErr.length > 0) console.warn(stdErr);
          } else {
            if (config.showNotifications) {
              window.showInformationMessage(`Compiled successfully -- ${doc.fileName}`, openButton)
              .then((choice) => {
                if (choice === 'Run') {
                  runInstaller(outFile);
                }
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

const showVersion = (): void => {
  let config: WorkspaceConfiguration = getConfig();

  getMakensis()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.version({pathToMakensis: pathToMakensis})
    .then(output => {
      window.showInformationMessage(`makensis ${output.stdout} (${pathToMakensis})`);
    }).catch(error => {
      console.error(error);
    });
  })
  .catch(pathWarning);
};

const showCompilerFlags = (): void => {
  clearOutput(nsisChannel);

  getMakensis()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    makensis.hdrInfo({pathToMakensis: pathToMakensis, json: true})
    .then(output => {
      nsisChannel.appendLine(JSON.stringify(output.stdout, null, 2));
      nsisChannel.show(true);
    }).catch(output => {
      nsisChannel.appendLine(JSON.stringify(output.stdout, null, 2));
      nsisChannel.show(true);
    });
  })
  .catch(pathWarning);
};

export { compile, showVersion, showCompilerFlags };
