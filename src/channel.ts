import vscode from 'vscode';
import { getConfig } from 'vscode-get-config';

export default {
  outputChannel: vscode.window.createOutputChannel('NSIS'),

  async clear(): Promise<void> {
    this.outputChannel.clear();

    const { alwaysShowOutput } = await getConfig('nsis');

    if (alwaysShowOutput) {
      this.show();
    }
  },

  dispose(): void {
    this.outputChannel.dispose();
  },

  async append(input: unknown): Promise<void> {
    this.outputChannel.append(input);

    const { alwaysShowOutput } = await getConfig('nsis');

    if (alwaysShowOutput) {
      this.show();
    }
  },

  async appendLine(input: string): Promise<void> {
    this.outputChannel.appendLine(input);

    const { alwaysShowOutput } = await getConfig('nsis');

    if (alwaysShowOutput) {
      this.show();
    }
  },

  hide(): void {
    this.outputChannel.hide();
  },

  show(preserveFocus = true): void {
    this.outputChannel.show(preserveFocus);
  }
}
