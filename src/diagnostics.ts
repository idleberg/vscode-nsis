import vscode from 'vscode';
import { compile } from 'makensis';
import { findErrors, findWarnings, getMakensisPath, getNullDevice, getPreprocessMode, getSpawnEnv } from './util';
import { getConfig } from 'vscode-get-config';

async function updateDiagnostics(document: vscode.TextDocument | null, collection: vscode.DiagnosticCollection): Promise<void> {
  if (document && document.languageId === 'nsis') {
    let pathToMakensis: string;

    try {
      pathToMakensis = await getMakensisPath();
    } catch (error) {
      console.error(error);

      return;
    }

    const preprocessMode = await getPreprocessMode();
    const { overrideCompression } = await getConfig('nsis');

    const options = {
      verbose: 2,
      pathToMakensis,
      postExecute: [
        getNullDevice()
      ],
      preprocessMode
    };

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
