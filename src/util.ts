import {
  commands,
  DiagnosticSeverity,
  Position,
  Range,
  window,
  workspace
} from 'vscode';

import open from 'open';
import { constants, promises as fs } from 'fs';
import { config as dotenvConfig } from 'dotenv';
import { exec, spawn } from 'child_process';
import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { dirname, resolve } from 'path';

// eslint-disable-next-line
async function clearOutput(channel: any): Promise<void> {
  const { alwaysShowOutput } = await getConfig('nsis');

  channel.clear();

  if (alwaysShowOutput === true) {
    channel.show(true);
  }
}

function detectOutfile(str: string): string {
  if (str.includes('Output: "')) {
    const regex = /Output: "(.*\.exe)"\r?\n/g;
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
}

function getPrefix(): string {
  return platform() === 'win32'
    ? '/'
    : '-';
}

function isHeaderFile(filePath: string): boolean {
  const headerFiles = [
    '.bnsh',
    '.nsh'
  ];

  return Boolean(headerFiles.filter(fileExt => filePath?.endsWith(fileExt)).length);
}

async function isWindowsCompatible(): Promise<boolean> {
  const { useWineToRun } = await getConfig('nsis');

  return platform() === 'win32' || useWineToRun === true
    ? true
    : false;
}

async function getMakensisPath(): Promise<string> {
  const { pathToMakensis } = await getConfig('nsis');

  return new Promise((resolve, reject) => {
    if (pathToMakensis && pathToMakensis.length) {
      console.log(`Using makensis path found in user settings: ${pathToMakensis}`);
      return resolve(pathToMakensis.trim());
    }

    const cp = spawn(which(), ['makensis']);

    cp.stdout.on('data', data => {
      const filePath = data.toString().trim();
      console.log(`Using makensis path detected on file system: ${filePath}`);
      return resolve(filePath);
    });

    cp.on('error', errorMessage => {
      console.error('[vscode-nsis]', errorMessage);
    });

    cp.on('exit', (code) => {
      if (code !== 0) {
        return reject(code);
      }
    });
  });
}

function mapPlatform(): string {
  const pf = platform();

  switch (pf) {
    case 'darwin':
      return 'osx';

    case 'win32':
      return 'osx';

    default:
      return pf;
  }
}

function openURL(cmd: string): void {
  open(`https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/${cmd}.html?utm_source=vscode&utm_content=reference`);
}

function pathWarning(): void {
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
}

async function revealInstaller(outFile: string): Promise<void> {
  if (outFile && await fileExists(outFile)) {
    switch (platform()) {
      case 'win32':
        spawn('explorer', [`/select,${outFile}`], {});
        break;

      case 'darwin':
        spawn('open', ['-R', outFile], {});
        break;

      case 'linux':
        try {
          spawn('nautilus', [outFile], {});
        } catch (error) {
          console.error(error);
        }
        break;
    }
  }
}

async function runInstaller(outFile: string): Promise<void> {
  if (outFile && await fileExists(outFile)) {
    const { useWineToRun } = await getConfig('nsis');

    if (platform() === 'win32') {
      exec(`cmd /c "${outFile}"`);
    } else if (useWineToRun === true) {
      spawn('wine', [ outFile ], {});
    }
  }
}

async function successNsis(choice: string, outFile: string): Promise<void> {
  switch (choice) {
    case 'Run':
      await runInstaller(outFile);
      break;

    case 'Reveal':
      await revealInstaller(outFile);
      break;
  }
}

function validateConfig(setting: string): void {
  if (typeof setting === 'string') {
    window.showErrorMessage('The argument handling has been changed in a recent version of this extension. Please adjust your settings before trying again.', 'Open Settings')
    .then(choice => {
      if (choice === 'Open Settings') {
        commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis compilerArguments');
      }
    });

    process.exit();
  }
}

function which(): string {
  return (platform() === 'win32')
    ? 'where'
    : 'which';
}

async function getPreprocessMode(): Promise<unknown> {
  const { preprocessMode } = await getConfig('nsis');

  switch (preprocessMode) {
    case 'PPO':
      return { ppo: true };
    case 'Safe PPO':
      return { safePPO: true };
    default:
      return undefined;
  }
}

async function isStrictMode(): Promise<boolean> {
  const { compilerArguments } = await getConfig('nsis');

  return (compilerArguments.includes('/WX') || compilerArguments.includes('-WX'));
}

function getLineLength(line: number): number {
  const editorText = window.activeTextEditor.document.getText();

  if (editorText && editorText.length) {
    const lines: string[] = editorText.split('\n');

    return lines[line].length;
  }

  return 0;
}

function showANSIDeprecationWarning() {
  window.showWarningMessage('ANSI targets are deprecated as of NSIS v3.05, consider moving to Unicode. You can mute this warning in the package settings.', 'Unicode Installer', 'Open Settings')
  .then(choice => {
    switch (choice) {
      case 'Open Settings':
        commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis muteANSIDeprecationWarning');
        break;

      case 'Unicode Installer':
        open('https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/Unicode.html?utm_source=vscode');
        break;

      default:
        break;
    }
  });

  process.exit();
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
  } catch (err) {
    return false;
  }

  return true;
}

async function findWarnings(input: string): Promise<unknown[]> {
  const warningLines = input.split('\n');
  let output = [];

  if (warningLines.length) {
    output = warningLines.map(async warningLine => {
      const result = /warning: (?<message>.*) \((?<file>.*?):(?<line>\d+)\)/.exec(warningLine);

      if (result !== null) {
          const warningLine = parseInt(result.groups.line) - 1;

          return {
            code: '',
            message: result.groups.message,
            range: new Range(new Position(warningLine, 0), new Position(warningLine, getLineLength(warningLine))),
            severity: await isStrictMode()
              ? DiagnosticSeverity.Error
              : DiagnosticSeverity.Warning
          };
        }
    });

    const { muteANSIDeprecationWarning } = await getConfig('nsis');

    if (!muteANSIDeprecationWarning && input.includes('7998: ANSI targets are deprecated')) {
      showANSIDeprecationWarning();
    }
  }

  return output;
}

function findErrors(input: string): unknown {
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
}

async function getProjectPath(): Promise<null | string> {
  let editor;

  try {
    editor = window.activeTextEditor;
  } catch (err) {
    return null;
  }

  const workspaceFolder = (await fs.lstat(editor.document.uri.fsPath)).isFile()
    ? dirname(editor.document.uri.fsPath)
    : editor.document.uri.fsPath;

  try {
    const { uri } = workspace.getWorkspaceFolder(workspaceFolder);
    return uri.fsPath || null;
  } catch (error) {
    return null;
  }
}

async function findEnvFile() {
  let envFile = undefined;
  const projectPath = await getProjectPath();

  if (projectPath) {
    switch (true) {
      case (await fileExists(resolve(projectPath, '.env.local'))):
        envFile = resolve(projectPath, '.env.local');
        break;

      case (process.env.NODE_ENV && await fileExists(resolve(projectPath, `.env.[${process.env.NODE_ENV}]`))):
        envFile = resolve(projectPath, `.env.[${process.env.NODE_ENV}]`);
        break;

      case (await fileExists(resolve(projectPath, '.env'))):
        envFile = resolve(projectPath, '.env');
        break;

      default:
        break;
    }

    if (envFile) console.log(`Found DotEnv file ${envFile}`);
  }

  return envFile;
}

async function initDotEnv(): Promise<void> {
  dotenvConfig({
    path: await findEnvFile()
  });
}

async function getSpawnEnv(): Promise<unknown> {
  const { integrated } = await getConfig('terminal');
  const mappedPlatform = mapPlatform();

  return {
    env: {
      NSISDIR: integrated.env[mappedPlatform].NSISDIR || process.env.NSISDIR || undefined,
      NSISCONFDIR: integrated.env[mappedPlatform].NSISCONFDIR || process.env.NSISCONFDIR || undefined,
    }
  };
}

function mapDefinitions(): string[] {
  return Object.keys(process.env).map(item => {
    if (item.startsWith('NSIS_APP_')) {
      const keyName = item.replace(/^NSIS_APP_/g, '')

      if (keyName.length && /[a-z0-9]+/gi.test(keyName)) {
        return `${getPrefix()}D${keyName}=${process.env[item]}`;
      }
    }
  }).filter(item => item);
}

export {
  clearOutput,
  detectOutfile,
  fileExists,
  findErrors,
  findWarnings,
  getMakensisPath,
  getPrefix,
  getPreprocessMode,
  getSpawnEnv,
  initDotEnv,
  isHeaderFile,
  isStrictMode,
  isWindowsCompatible,
  mapDefinitions,
  mapPlatform,
  openURL,
  pathWarning,
  revealInstaller,
  runInstaller,
  successNsis,
  validateConfig,
  which
};
