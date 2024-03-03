import vscode from 'vscode';

export default {
  outputChannel: vscode.window.createOutputChannel('NSIS', 'makensis-log'),

  async clear(): Promise<void> {
    this.outputChannel.clear();
  },

  dispose(): void {
    this.outputChannel.dispose();
  },

  async append(input: unknown): Promise<void> {
    this.outputChannel.append(input);
  },

  async appendLine(input: string): Promise<void> {
    this.outputChannel.appendLine(input);
  },

  hide(): void {
    this.outputChannel.hide();
  },

  show(preserveFocus = true): void {
    this.outputChannel.show(preserveFocus);
  }
}
