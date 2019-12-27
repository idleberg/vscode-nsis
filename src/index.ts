'use strict';

import { commands, ExtensionContext } from 'vscode';

// Load package components
import { compile, showCompilerFlags, showVersion, showHelp } from './makensis';
import { createTask } from './task';
import { convert } from './nlf';
import { bridleNsis, nslAssembler} from './transpiler';

const activate = (context: ExtensionContext) => {
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
      commands.registerTextEditorCommand('extension.nsis.command-reference', (editor) => {
        return showHelp();
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

    context.subscriptions.push(
      commands.registerTextEditorCommand('extension.nsis.convert-language-file', (editor) => {
        return convert();
      })
    );
};

export { activate };
