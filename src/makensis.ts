'use strict';

import { window } from 'vscode';

import { clearOutput, getConfig, getPrefix, makeNsis, pathWarning, sanitize } from './util';
import { spawn } from 'child_process';

const nsisChannel = window.createOutputChannel('NSIS');

const compile = (strictMode: boolean) => {
  clearOutput(nsisChannel);

  if (window.activeTextEditor['_documentData']['_languageId'] !== 'nsis') {
    nsisChannel.appendLine('This command is only available for NSIS files');
    return;
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    makeNsis()
    .then(sanitize)
    .then( (pathToMakensis: string) => {
      let prefix: string = getPrefix();
      let config: any = getConfig();

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
      const makensis = spawn(pathToMakensis, compilerArguments);

      let stdErr: string = '';
      let hasWarning: boolean = false;

      makensis.stdout.on('data', (line: Array<string> ) => {
        if (line.indexOf('warning: ') !== -1) {
          hasWarning = true;
        }
        nsisChannel.appendLine(line.toString());
      });

      makensis.stderr.on('data', (line: Array<any>) => {
        stdErr += '\n' + line;
        nsisChannel.appendLine(line.toString());
      });

      makensis.on('close', (code) => {
        if (code === 0) {
          if (hasWarning === true) {
            if (config.showNotifications) window.showWarningMessage(`Compiled with warnings -- ${doc.fileName}`);
            if (stdErr.length > 0) console.warn(stdErr);
          } else {
            if (config.showNotifications) window.showInformationMessage(`Compiled successfully -- ${doc.fileName}`);
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

const showVersion = () => {
  let config: any = getConfig();
  let prefix: string = getPrefix();

  makeNsis()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    const makensis = spawn(pathToMakensis, [ `${prefix}VERSION` ]);

    makensis.stdout.on('data', (version: Array<string> ) => {
      window.showInformationMessage(`makensis ${version} (${pathToMakensis})`);
    });
  })
  .catch(pathWarning);
};

const showCompilerFlags = () => {
  clearOutput(nsisChannel);

  makeNsis()
  .then(sanitize)
  .then( (pathToMakensis: string) => {
    let config: any = getConfig();
    let prefix: string = getPrefix();

    const makensis = spawn(pathToMakensis, [ `${prefix}HDRINFO` ]);

    makensis.stdout.on('data', (flags: Array<string> ) => {
      nsisChannel.appendLine(flags.toString());
    });

    makensis.on('close', (code) => {
      if (code === 0) {
        nsisChannel.show(true);
      }
    });
  })
  .catch(pathWarning);
};

export { compile, showVersion, showCompilerFlags };
