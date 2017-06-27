'use strict';

import { commands } from 'vscode';

// Load package components
import { compile, showCompilerFlags, showVersion } from './makensis';
import { createTask } from './task';
import { bridleNsis, nslAssembler} from './transpiler';

let activate = (context) => {
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
      commands.registerTextEditorCommand('extension.nsis.show-version', (editor) => {
        return showVersion();
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.show-compiler-flags', (editor) => {
        return showCompilerFlags();
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.transpile-bridlensis', (editor) => {
        return bridleNsis(editor);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return nslAssembler(editor);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
        return createTask();
      })
    );
};

export { activate };
