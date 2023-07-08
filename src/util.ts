import { constants, promises as fs } from 'fs';
import { exec, spawn } from 'child_process';
import type { SpawnOptions } from 'node:child_process';
import { getConfig } from 'vscode-get-config';
import { platform } from 'os';
import { resolve } from 'path';
import nsisChannel from './channel';
import open from 'open';
import vscode from 'vscode';
import which from 'which';

type DiagnosticCollection = {
  code?: string;
  message?: string;
  range?: vscode.Range;
  severity?: vscode.DiagnosticSeverity;
}

export function getNullDevice(): string {
  return isWindows()
    ? 'OutFile NUL'
    : 'OutFile /dev/null/';
}

export function getPrefix(): string {
  return isWindows()
    ? '/'
    : '-';
}

export function isHeaderFile(filePath: string): boolean {
  const headerFiles = [
    '.bnsh',
    '.nsh'
  ];

  return Boolean(headerFiles.filter(fileExt => filePath?.endsWith(fileExt)).length);
}

export function isWindows(): boolean {
  return platform() === 'win32'
}

export async function isWindowsCompatible(): Promise<boolean> {
  const { wine } = await getConfig('nsis');

  return isWindows() || wine.runWithWine === true
    ? true
    : false;
}

export async function getMakensisPath(): Promise<string> {
  const { compiler } = await getConfig('nsis');

  const pathToMakensis = isWindows() && compiler.pathToMakensis.startsWith('"') && compiler.pathToMakensis.startsWith('"')
    ? compiler.pathToMakensis.replace(/^"/, '').replace(/"$/, '').trim()
    : compiler.pathToMakensis.trim();

  if (pathToMakensis?.length && pathToMakensis !== 'makensis') {
    console.log(`Using makensis path found in user settings: ${pathToMakensis}`);

    return resolve(pathToMakensis.trim());
  }

  try {
    const result = String(await which('makensis'));
    return result;
  } catch (error) {
    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
    const choice = await vscode.window.showWarningMessage('Please make sure that makensis is installed and exposed in your PATH environment variable. Alternatively, you can specify its path in the settings.', 'Open Settings');
    if (choice === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis pathToMakensis');
    }

    console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
  }

  return 'makensis';
}

export function mapPlatform(): string {
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

export function openURL(cmd: string): void {
  open(`https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Commands/${cmd}.html?utm_source=vscode&utm_content=reference`);
}

export async function pathWarning(): Promise<void> {
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

export async function revealInstaller(outFile: string): Promise<void> {
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
          console.error('[vscode-nsis]', error instanceof Error ? error.message : error);
        }
        break;
    }
  }
}

export async function runInstaller(outFile: string): Promise<void> {
  if (outFile && await fileExists(outFile)) {
    const { wine } = await getConfig('nsis');

    if (isWindows()) {
      exec(`cmd /c "${outFile}"`);
    } else if (wine.runWithWine === true) {
      spawn(wine.pathToWine, [ outFile ], {});
    }
  }
}

export async function buttonHandler(choice: string, outFile?: string): Promise<void> {
  switch (choice) {
    case 'Run':
      await runInstaller(outFile);
      break;

    case 'Reveal':
      await revealInstaller(outFile);
      break;

    case 'Show Output':
      nsisChannel.show();
      break;
  }
}

export async function getPreprocessMode(): Promise<string> {
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

export async function getOverrideCompression(): Promise<string> {
  const { diagnostics } = await getConfig('nsis');

  return diagnostics.overrideCompression || true;
}

export function getLineLength(line: number): number {
  const editorText = vscode.window.activeTextEditor?.document.getText();

  if (editorText && editorText.length) {
    const lines: string[] = editorText.split('\n');

    return lines[line].length;
  }

  return 0;
}

export async function showANSIDeprecationWarning(): Promise<void> {
  const choice = await vscode.window.showWarningMessage('ANSI targets are deprecated as of NSIS v3.05, consider moving to Unicode. You can mute this warning in the package settings.', 'Unicode Installer', 'Open Settings')

  switch (choice) {
    case 'Open Settings':
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis muteANSIDeprecationWarning');
      break;

    case 'Unicode Installer':
      open('https://idleberg.github.io/NSIS.docset/Contents/Resources/Documents/html/Commands/Unicode.html?utm_source=vscode');
      break;

    default:
      break;
  }

  process.exit();
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
  } catch (err) {
    return false;
  }

  return true;
}

export async function findWarnings(input: string): Promise<unknown[]> {
  const output: DiagnosticCollection[] = [];

  const warningLines = input.split('\n');
  if (!warningLines.length) {
    return [output];
  }

  if (warningLines.length) {
    // Note to self: Don't use map()
    warningLines.forEach(async warningLine => {
      const result = /warning: (?<message>.*) \((?<file>.*?):(?<line>\d+)\)/.exec(warningLine);

      if (result !== null) {
        const warningLine = parseInt(String(result?.groups?.line)) - 1;

        output.push({
          code: '',
          message: result.groups?.message,
          range: new vscode.Range(new vscode.Position(warningLine, 0), new vscode.Position(warningLine, getLineLength(warningLine))),
          severity: vscode.DiagnosticSeverity.Warning
        });
      }
    });

    if (!await getConfig('nsis') && input.includes('7998: ANSI targets are deprecated')) {
      showANSIDeprecationWarning();
    }
  }

  return output;
}

export function findErrors(input: string): DiagnosticCollection {
  const result = /(?<message>.*)\r?\n.*rror in script:? "(?<file>.*)" on line (?<line>\d+)/.exec(input);

  if (result !== null) {
    const errorLine = parseInt(String(result?.groups?.line)) - 1;

    return {
      code: '',
      message: result?.groups?.message,
      range: new vscode.Range(new vscode.Position(errorLine, 0), new vscode.Position(errorLine, getLineLength(errorLine))),
      severity: vscode.DiagnosticSeverity.Error
    };
  }

  return {};
}

export async function getProjectPath(): Promise<null | string> {
  let editor;

  try {
    editor = vscode.window.activeTextEditor;
  } catch (err) {
    return null;
  }

  try {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

    return workspaceFolder ? workspaceFolder.uri.fsPath : '';
  } catch (error) {
    return null;
  }
}

export async function getSpawnEnv(): Promise<SpawnOptions> {
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

export function inRange(value: number | string, min: number, max: number): boolean {
  return Number(value) >= min && Number(value) <= max;
}

export function hasArgument(needle: string | string[], argument: string): boolean {
  needle = typeof needle === 'string'
    ? [needle]
    : needle;

  return needle.includes(`/${argument}`) || needle.includes(`-${argument}`)
    ? true
    : false;
}
