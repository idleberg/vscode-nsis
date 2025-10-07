import type { CompilerOptions, CompilerOutput } from 'makensis';
import { compile } from 'makensis';

import micromatch from 'micromatch';
import type { DiagnosticCollection, TextDocument } from 'vscode';
import { getConfig } from 'vscode-get-config';
import {
	findErrors,
	findWarnings,
	getMakensisPath,
	getNullDevice,
	getOverrideCompression,
	getPreprocessMode,
	getSpawnEnv,
} from './util';

export async function updateDiagnostics(
	document: TextDocument | null,
	collection: DiagnosticCollection,
): Promise<void> {
	if (!document) {
		return;
	}

	const { compiler, diagnostics } = await getConfig('nsis');

	if (diagnostics.enableDiagnostics !== true) {
		return;
	}

	if (diagnostics.excludedFiles?.length) {
		if (micromatch.isMatch(document.fileName, diagnostics.excludedFiles)) {
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
			console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);

			return;
		}

		const options: CompilerOptions = {
			verbose: 2,
			pathToMakensis,
			postExecute: [getNullDevice()],
			rawArguments: diagnostics?.useCustomArguments ? diagnostics.customArguments : compiler.customArguments,
		};

		const preprocessMode = await getPreprocessMode();

		if (preprocessMode?.length) {
			options[preprocessMode] = true;
		}

		const overrideCompression = await getOverrideCompression();

		if (overrideCompression) {
			options.preExecute = ['SetCompressor /FINAL zlib'];
			(options.postExecute as string[]).push('SetCompress off');
		}

		let output: CompilerOutput;

		try {
			output = await compile(document.fileName, options, await getSpawnEnv());
		} catch (error) {
			console.error('[idleberg.nsis]', error instanceof Error ? error.message : error);
		}

		const diagnosticsResult: DiagnosticCollection[] = [];

		const warnings = await findWarnings(output?.stdout);
		if (warnings) {
			diagnosticsResult.push(...warnings);
		}

		const error = findErrors(output?.stderr);
		if (error) {
			diagnosticsResult.push(error);
		}

		collection.set(document.uri, diagnosticsResult);
	} else {
		collection.clear();
	}
}
