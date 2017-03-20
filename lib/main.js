'use strict';

const vscode = require('vscode');
const meta = require('../package.json');

// Load package components
const bridleNsis = require('./transpile-bridlensis');
const buildTask = require('./task');
const getPath = require('./helpers').getPath;
const makeNsis = require('./compile-nsis');
const nslAssembler = require('./transpile-nsl');
const spawn = require('child_process').spawn;

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile', (editor) => {
        return makeNsis.compile(editor, false);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.compile-strict', (editor) => {
        return makeNsis.compile(editor, true);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.transpile-bridlensis', (editor) => {
        return bridleNsis.transpile(editor);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.transpile-nsl', (editor) => {
        return nslAssembler.transpile(editor);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.nsis.create-build-task', (editor) => {
        return buildTask.create(editor);
      })
    );
  },

  deactivate () { }
};
