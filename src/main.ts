'use strict';

import { commands } from 'vscode';

// Load package components
import { compile } from './compile-nsis';
import { createTask } from './task';
import { transpileBridle } from './transpile-bridlensis';
import { transpileNsl } from './transpile-nsl';

export function activate(context) {
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return compile(editor, false);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
        return compile(editor, true);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.transpile-bridlensis', (editor) => {
        return transpileBridle(editor);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return transpileNsl(editor);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
        return createTask();
      })
    );
}
