import vscode from 'vscode';

export default {
  outputChannel: vscode.window.createOutputChannel('NSIS'),

  clear(showChannel = false): void {
    this.outputChannel.clear();

    if (showChannel) {
      this.show();
    }
  },

  dispose(): void {
    this.outputChannel.dispose();
  },

  append(input: unknown, showChannel = false): void {
    this.outputChannel.append(input);

    if (showChannel) {
      this.show();
    }
  },

  appendLine(input: string, showChannel = false): void {
    this.outputChannel.appendLine(input);

    if (showChannel) {
      this.show();
    }
  },

  hide(): void {
    this.outputChannel.hide();
  },

  show(preserveFocus = false): void {
    this.outputChannel.show(preserveFocus);
  }
}
