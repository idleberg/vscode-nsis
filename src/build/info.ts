import { headerInfo, version } from 'makensis';
import { window } from 'vscode';
import { getCompilerOptions, getConfiguration, getMakensisPath, getSpawnEnv } from '../makensis.ts';
import { getInfoChannel } from './channels.ts';

/**
 * Reports the compiler's version, either as a notification or in the
 * "NSIS Info" channel alongside the path it was resolved from.
 */
export async function showCompilerVersion(): Promise<void> {
	const [options, pathToMakensis] = await Promise.all([getCompilerOptions(), getMakensisPath()]);

	let compilerVersion: string;

	try {
		const { stdout } = await version({ ...options, json: true }, getSpawnEnv());

		compilerVersion = String(stdout?.version ?? '(unknown)');
	} catch (error) {
		reportFailure('read the compiler version', error);

		return;
	}

	if (getConfiguration().get<boolean>('compiler.showVersionAsInfoMessage', false)) {
		window.showInformationMessage(`makensis ${compilerVersion} (${pathToMakensis})`);

		return;
	}

	write(JSON.stringify({ version: compilerVersion, path: pathToMakensis }, null, 2));
}

/**
 * Reports the options `makensis` itself was built with, as either its raw
 * `-HDRINFO` output or the structured form of it.
 */
export async function showCompilerFlags(): Promise<void> {
	const asObject = getConfiguration().get<boolean>('compiler.showFlagsAsObject', true);
	const options = await getCompilerOptions();

	try {
		if (asObject) {
			const { stdout } = await headerInfo({ ...options, json: true }, getSpawnEnv());

			write(JSON.stringify(stdout, null, 2));
		} else {
			const { stdout, stderr } = await headerInfo(options, getSpawnEnv());

			write(stdout || stderr || '');
		}
	} catch (error) {
		reportFailure('read the compiler flags', error);
	}
}

function write(message: string): void {
	const channel = getInfoChannel();

	channel.clear();
	channel.append(message);
	channel.show(true);
}

function reportFailure(action: string, error: unknown): void {
	// `makensis` rejects with the raw stderr when the compiler cannot be started.
	console.error('[idleberg.nsis]', error);
	window.showErrorMessage(
		`Failed to ${action}: ${error instanceof Error ? error.message : String(error || 'makensis could not be started.')}`,
	);
}
