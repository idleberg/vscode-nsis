'use strict';

import { commands } from 'vscode';

// Load package components
import { compile, showCompilerFlags, showVersion } from './makensis';
import { createTask } from './task';
import { bridleNsis, nslAssembler} from './transpiler';

const activate = (context) => {
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return compile(false);
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
        return compile(true);
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
        return bridleNsis();
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return nslAssembler();
      })
    );
    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
        return createTask();
      })
    );
};

export { activate };
