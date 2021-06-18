import vscode from 'vscode';
import { basename } from 'path';
import { compile } from 'makensis';
import { findErrors, findWarnings, getMakensisPath, getNullDevice, getPreprocessMode, getOverrideCompression, getSpawnEnv } from './util';
import { getConfig } from 'vscode-get-config';
import micromatch from 'micromatch';

async function updateDiagnostics(document: vscode.TextDocument | null, collection: vscode.DiagnosticCollection): Promise<void> {
  const { diagnostics } = await getConfig('nsis');

  if (diagnostics.enableDiagnostics !== true) return;

  if (diagnostics.excludedFiles?.length) {
    const documentBasename = basename(document.fileName);
    if (micromatch.isMatch(documentBasename, diagnostics.excludedFiles)) {
      console.log(`Skipping diagnostics for ${document.fileName}, found in exclude list`);
      collection.clear();
      return;
    }
  }


  if (document && document.languageId === 'nsis') {
    console.log(`Running diagnostics for ${document.fileName}`);

    let pathToMakensis: string;

    try {
      pathToMakensis = await getMakensisPath();
    } catch (error) {
      console.error(error);

      return;
    }

    const options = {
      verbose: 2,
      pathToMakensis,
      postExecute: [
        getNullDevice()
      ]
    };

    const preprocessMode = await getPreprocessMode();

    if (preprocessMode?.length) {
      options[preprocessMode] = true;
    }

    const overrideCompression = await getOverrideCompression();

    if (overrideCompression) {
      options['preExecute'] = ['SetCompressor /FINAL zlib'];
      options['postExecute'].push('SetCompress off');
    }

    let output;

    try {
      output = await compile(document.fileName, options, await getSpawnEnv());
    } catch (error) {
      console.error(error);
    }

    const diagnostics = [];

    const warnings = await findWarnings(output.stdout);
    if (warnings) diagnostics.push(...warnings);

    const error = findErrors(output.stderr);
    if (error) diagnostics.push(error);

    collection.set(document.uri, diagnostics);
  } else {
    collection.clear();
  }
}

export {
  updateDiagnostics
};
