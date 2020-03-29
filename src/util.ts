'use strict';

import {
  commands,
  DiagnosticSeverity,
  Position,
  Range,
  window,
  workspace,
  WorkspaceConfiguration
} from 'vscode';

import * as open from 'open';
import { basename, dirname, extname, join } from 'path';
import { access } from 'fs';
import { platform } from 'os';
import { exec, spawn } from 'child_process';

const clearOutput = (channel): void => {
  const config: WorkspaceConfiguration = getConfig();

  channel.clear();
  if (config.alwaysShowOutput === true) {
    channel.show(true);
  }
};

const detectOutfile = (str): string => {
  if (str.includes('Output: "')) {
    const regex = /Output: \"(.*\.exe)\"\r?\n/g;
    const result = regex.exec(str.toString());

    if (typeof result === 'object') {
      try {
        return result['1'];
      } catch (e) {
        return '';
      }
    }
  }

  return '';
};

const getConfig = (): WorkspaceConfiguration => {
  return workspace.getConfiguration('nsis');
};

const getPrefix = (): string => {
  if (platform() === 'win32') {
    return '/';
  }

  return '-';
};

const isWindowsCompatible = (): boolean => {
  const config: WorkspaceConfiguration = getConfig();

  if (platform() === 'win32' || config.useWineToRun === true) {
    return true;
  }

  return false;
};

const getMakensisPath = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pathToMakensis: string = getConfig().pathToMakensis;

    if (pathToMakensis && pathToMakensis.length) {
      console.log('Using makensis path found in user settings: ' + pathToMakensis);
      return resolve(pathToMakensis);
    }

    const which = spawn(this.which(), ['makensis']);

    which.stdout.on('data', (data) => {
      console.log('Using makensis path detected on file system: ' + data);
      return resolve(data);
    });

    which.on('exit', (code) => {
      if (code !== 0) {
        return reject(code);
      }
    });
  });
};

const openURL = (cmd: string): void => {
  open(`https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/${cmd}.html?utm_source=vscode&utm_content=reference`);
};

const pathWarning = (): any => {
  window.showWarningMessage('makensis is not installed or missing in your PATH environmental variable', 'Download', 'Help')
  .then(choice => {
    switch (choice) {
      case 'Download':
        open('https://sourceforge.net/projects/nsis/');
        break;
      case 'Help':
        open('http://superuser.com/a/284351/195953');
        break;
    }
  });
};

const revealInstaller = (outFile) => {
    return access(outFile, 0, (error) => {
      if (error || outFile === '') {
        return console.error(error);
      }

      switch (platform()) {
        case 'win32':
          spawn('explorer', [`/select,${outFile}`]);
          break;
        case 'darwin':
          spawn('open', ['-R', outFile]);
          break;
        case 'linux':
          try {
            spawn('nautilus', [outFile]);
          } catch (error) {
            console.error(error);
          }
          break;
      }
    });
  };

const runInstaller = (outFile): void => {
  let config: WorkspaceConfiguration = getConfig();

  if (platform() === 'win32') {
    exec(`cmd /c "${outFile}"`);
  } else if (config.useWineToRun === true) {
    spawn('wine', [ outFile ]);
  }
};

const sanitize = (response: Object): string => {
  return response.toString().trim();
};

const successNsis = (choice, outFile) => {
  switch (choice) {
    case 'Run':
      runInstaller(outFile);
      break;
    case 'Reveal':
      revealInstaller(outFile);
      break;
  }
};

const successNslAssembler = (choice): void => {
  let document = window.activeTextEditor.document;

  if (choice === 'Open') {
    let dirName = dirname(document.fileName);
    let extName = extname(document.fileName);
    let baseName = basename(document.fileName, extName);
    let outName = baseName + '.nsi';
    let nsisFile = join(dirName, outName);

    workspace.openTextDocument(nsisFile)
    .then( (doc) => {
      window.showTextDocument(doc);
    });
  }
};

const validateConfig = (setting: string): void => {
  if (typeof setting === 'string') {
    window.showErrorMessage('The argument handling has been changed in a recent version of this extension. Please adjust your settings before trying again.', 'Open Settings')
    .then(choice => {
      if (choice === 'Open Settings') {
        commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
      }
    });

    process.exit();
  }
};

const which = (): string => {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
};

const getPreprocessMode = (): Object => {
  const { preprocessMode } = getConfig();

  switch (preprocessMode) {
    case 'PPO':
      return { ppo: true };
    case 'Safe PPO':
      return { safePPO: true };
    default:
      return {};
  }
};

const isStrictMode = (): boolean => {
  const { compilerArguments } = getConfig();

  return (compilerArguments.includes('/WX') || compilerArguments.includes('-WX'));
};

const getLineLength = (line: number): number => {
  const editorText = window.activeTextEditor.document.getText();

  if (editorText && editorText.length) {
    const lines: string[] = editorText.split('\n');

    return lines[line].length;
  }

  return 0;
};

const showANSIDeprecationWarning = () => {
  window.showWarningMessage('ANSI targets are deprecated as of NSIS v3.05, consider moving to Unicode. You can mute this warning in the package settings.', 'Unicode Installer', 'Open Settings')
  .then(choice => {
    switch (choice) {
      case 'Open Settings':
        commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
        break;
      case 'Unicode Installer':
        open('https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/Unicode.html?utm_source=vscode');
        break;
      default:
        break;
    }
  });

  process.exit();
};


const findWarnings = (input: string) => {
  const output = [];
  const warningLines = input.split('\n');

  if (warningLines.length) {
    warningLines.forEach(warningLine => {
      const result = /warning: (?<message>.*) \((?<file>.*?):(?<line>\d+)\)/.exec(warningLine);

      if (result !== null) {
          const warningLine = parseInt(result.groups.line) - 1;

          output.push({
            code: '',
            message: result.groups.message,
            range: new Range(new Position(warningLine, 0), new Position(warningLine, getLineLength(warningLine))),
            severity: isStrictMode() ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning
          });
        }
    });

    const { muteANSIDeprecationWarning } = getConfig();

    if (!muteANSIDeprecationWarning && input.includes('7998: ANSI targets are deprecated')) {
      showANSIDeprecationWarning();
    }
  }

  return output;
};

const findErrors = (input: string) => {
  const result = /(?<message>.*)\r?\n.*rror in script:? "(?<file>.*)" on line (?<line>\d+)/.exec(input);

  if (result !== null) {
    const errorLine = parseInt(result.groups.line) - 1;

    return {
      code: '',
      message: result.groups.message,
      range: new Range(new Position(errorLine, 0), new Position(errorLine, getLineLength(errorLine))),
      severity: DiagnosticSeverity.Error
    };
  }

  return {};
};

export {
  clearOutput,
  detectOutfile,
  findErrors,
  findWarnings,
  getConfig,
  getMakensisPath,
  getPrefix,
  getPreprocessMode,
  isStrictMode,
  isWindowsCompatible,
  openURL,
  pathWarning,
  revealInstaller,
  runInstaller,
  sanitize,
  successNslAssembler,
  successNsis,
  validateConfig,
  which
};
