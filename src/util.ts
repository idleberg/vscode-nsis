import { constants, promises as fs } from 'fs';
import { exec, spawn } from 'child_process';
import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { resolve } from 'path';
import open from 'open';
import vscode from 'vscode';
import which from 'which';

function getNullDevice(): string {
  return isWindows()
    ? 'OutFile NUL'
    : 'OutFile /dev/null/';
}

function getPrefix(): string {
  return isWindows()
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

function isWindows(): boolean {
  return platform() === 'win32'
}

async function isWindowsCompatible(): Promise<boolean> {
  const { useWineToRun } = await getConfig('nsis');

  return isWindows() || useWineToRun === true
    ? true
    : false;
}

async function getMakensisPath(): Promise<string> {
  const { compiler } = await getConfig('nsis');

    if (compiler.pathToMakensis?.length && compiler.pathToMakensis !== 'makensis') {
      console.log(`Using makensis path found in user settings: ${compiler.pathToMakensis}`);
      return resolve(compiler.pathToMakensis.trim());
    }

    return String(await which('makensis')) || 'makensis';
}

function mapPlatform(): string {
  const pf = platform();

  switch (pf) {
    case 'darwin':
      return 'osx';

    case 'win32':
      return 'windows';

    default:
      return pf;
  }
}

function openURL(cmd: string): void {
  open(`https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/${cmd}.html?utm_source=vscode&utm_content=reference`);
}

async function pathWarning(): Promise<void> {
  const choice = await vscode.window.showWarningMessage('makensis is not installed or missing in your PATH environmental variable', 'Download', 'Help')

  switch (choice) {
    case 'Download':
      open('https://sourceforge.net/projects/nsis/');
      break;

    case 'Help':
      open('http://superuser.com/a/284351/195953');
      break;
  }
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

    if (isWindows()) {
      exec(`cmd /c "${outFile}"`);
    } else if (useWineToRun === true) {
      spawn('wine', [ outFile ], {});
    }
  }
}

async function buttonHandler(choice: string, outFile: string): Promise<void> {
  switch (choice) {
    case 'Run':
      await runInstaller(outFile);
      break;

    case 'Reveal':
      await revealInstaller(outFile);
      break;
  }
}

async function getPreprocessMode(): Promise<string> {
  const { diagnostics } = await getConfig('nsis');

  switch (diagnostics.preprocessMode) {
    case 'PPO':
      return 'ppo';
    case 'Safe PPO':
      return 'safePPO';
    default:
      return '';
  }
}

async function getOverrideCompression(): Promise<string> {
  const { diagnostics } = await getConfig('nsis');

  return diagnostics.overrideCompression || true;
}

function getLineLength(line: number): number {
  const editorText = vscode.window.activeTextEditor.document.getText();

  if (editorText && editorText.length) {
    const lines: string[] = editorText.split('\n');

    return lines[line].length;
  }

  return 0;
}

async function showANSIDeprecationWarning(): Promise<void> {
  const choice = await vscode.window.showWarningMessage('ANSI targets are deprecated as of NSIS v3.05, consider moving to Unicode. You can mute this warning in the package settings.', 'Unicode Installer', 'Open Settings')

  switch (choice) {
    case 'Open Settings':
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis muteANSIDeprecationWarning');
      break;

    case 'Unicode Installer':
      open('https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Reference/Unicode.html?utm_source=vscode');
      break;

    default:
      break;
  }

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
  const output = [];

  const warningLines = input.split('\n');
  if (!warningLines.length) return ;

  if (warningLines.length) {
    // Note to self: Don't use map()
    warningLines.forEach(async warningLine => {
      const result = /warning: (?<message>.*) \((?<file>.*?):(?<line>\d+)\)/.exec(warningLine);

      if (result !== null) {
        const warningLine = parseInt(result.groups.line) - 1;

        output.push({
          code: '',
          message: result.groups.message,
          range: new vscode.Range(new vscode.Position(warningLine, 0), new vscode.Position(warningLine, getLineLength(warningLine))),
          severity: vscode.DiagnosticSeverity.Warning
        });
      }
    });

    if (!await getConfig('nsis') && input.includes('7998: ANSI targets are deprecated')) {
      showANSIDeprecationWarning();
    }

    return output;
  }
}

function findErrors(input: string): unknown {
  const result = /(?<message>.*)\r?\n.*rror in script:? "(?<file>.*)" on line (?<line>\d+)/.exec(input);

  if (result !== null) {
    const errorLine = parseInt(result.groups.line) - 1;

    return {
      code: '',
      message: result.groups.message,
      range: new vscode.Range(new vscode.Position(errorLine, 0), new vscode.Position(errorLine, getLineLength(errorLine))),
      severity: vscode.DiagnosticSeverity.Error
    };
  }

  return {};
}

async function getProjectPath(): Promise<null | string> {
  let editor;

  try {
    editor = vscode.window.activeTextEditor;
  } catch (err) {
    return null;
  }

  try {
    const { uri } = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    return uri.fsPath;
  } catch (error) {
    return null;
  }
}

async function getSpawnEnv(): Promise<unknown> {
  const { integrated } = vscode.workspace.getConfiguration('terminal');
  const mappedPlatform = mapPlatform();

  return {
    env: {
      NSISDIR: integrated.env[mappedPlatform].NSISDIR || process.env.NSISDIR || undefined,
      NSISCONFDIR: integrated.env[mappedPlatform].NSISCONFDIR || process.env.NSISCONFDIR || undefined,
      LANGUAGE: !isWindows() && !process.env.LANGUAGE ? 'en_US.UTF-8' : undefined,
      LC_ALL: !isWindows() && !process.env.LC_ALL ? 'en_US.UTF-8' : undefined,
    }
  };
}

export {
  fileExists,
  findErrors,
  findWarnings,
  getMakensisPath,
  getNullDevice,
  getPrefix,
  getPreprocessMode,
  getProjectPath,
  getOverrideCompression,
  getSpawnEnv,
  isHeaderFile,
  isWindowsCompatible,
  mapPlatform,
  openURL,
  pathWarning,
  revealInstaller,
  runInstaller,
  buttonHandler,
  which
};
