import { window } from 'vscode';

export const infoChannel = window.createOutputChannel('NSIS Info', 'json');
export const makensisChannel = window.createOutputChannel('NSIS Compiler', 'makensis');
