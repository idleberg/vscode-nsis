import type { SpawnOptions } from 'node:child_process';
import type { CompilerOptions } from 'makensis';
import { nsisDir } from 'makensis';
import { commands, env, Uri, type WorkspaceConfiguration, window, workspace } from 'vscode';
import { findOnPath, isWindows, locate, mapPlatform } from './util.ts';

const BINARY_NAME = isWindows() ? 'makensis.exe' : 'makensis';

let nsisDirectory: Promise<string | null> | undefined;
let warnedAboutPath = false;

export function getConfiguration(): WorkspaceConfiguration {
	return workspace.getConfiguration('nsis');
}

/**
 * Wine is how NSIS is compiled on macOS and Linux when only a Windows build of
 * `makensis` is available. It is never used on Windows itself, whatever the
 * setting says.
 */
export function useWine(): boolean {
	return !isWindows() && getConfiguration().get<boolean>('wine.runWithWine', false);
}

/**
 * Resolves the `makensis` binary from the `nsis.makensis.path` setting,
 * falling back to the `PATH`. The configured path is returned unresolved when it
 * cannot be located, so that Wine prefix paths — which mean nothing to this
 * process — still reach the compiler.
 */
export async function getMakensisPath(): Promise<string> {
	const configured = stripQuotes(getConfiguration().get<string>('makensis.path', '').trim());

	if (configured && configured !== 'makensis') {
		return locate(configured) ?? configured;
	}

	const found = findOnPath(BINARY_NAME);

	if (found) {
		return found;
	}

	// Under Wine the compiler lives inside a prefix and is never on the `PATH`,
	// so let it through and let the spawn fail with something more useful.
	if (!useWine()) {
		await warnAboutMissingBinary();
	}

	return 'makensis';
}

/**
 * The options every `makensis` invocation shares: which binary to run, and
 * whether to run it through Wine.
 */
export async function getCompilerOptions(): Promise<CompilerOptions> {
	const pathToMakensis = await getMakensisPath();

	return useWine()
		? { pathToMakensis, wine: true, pathToWine: getConfiguration().get<string>('wine.pathToWine', 'wine') }
		: { pathToMakensis };
}

/**
 * `makensis` reads `NSISDIR` and `NSISCONFDIR` from the environment. Honouring
 * `terminal.integrated.env` means a workspace that already sets them for its
 * terminal does not have to set them a second time.
 */
export function getSpawnEnv(): SpawnOptions {
	const overrides =
		workspace.getConfiguration('terminal.integrated.env').get<Record<string, string>>(mapPlatform()) ?? {};

	const env: NodeJS.ProcessEnv = { ...process.env };

	if (overrides.NSISDIR) {
		env.NSISDIR = overrides.NSISDIR;
	}

	if (overrides.NSISCONFDIR) {
		env.NSISCONFDIR = overrides.NSISCONFDIR;
	}

	if (!isWindows()) {
		// Fixes occasional mangling of non-ASCII compiler output.
		env.LANG ||= 'en_US.UTF-8';
		env.LANGUAGE ||= 'en_US.UTF-8';
		env.LC_ALL ||= 'en_US.UTF-8';
	}

	return { env };
}

/**
 * The NSIS installation directory, as reported by the compiler itself. Spawning
 * `makensis` is expensive enough to cache, and cheap enough to redo whenever the
 * compiler settings change.
 *
 * Resolving `!include` document links needs this, so it lives here rather than
 * alongside the commands that currently use it.
 */
export async function getNsisDirectory(): Promise<string | null> {
	nsisDirectory ??= (async () => {
		try {
			return await nsisDir(await getCompilerOptions(), getSpawnEnv());
		} catch (error) {
			console.error('[idleberg.nsis]', 'Failed to determine NSISDIR', error);

			return null;
		}
	})();

	return nsisDirectory;
}

/**
 * Drops everything derived from the compiler settings. Called when those
 * settings change, so a corrected path takes effect without a reload.
 */
export function resetCompilerState(): void {
	nsisDirectory = undefined;
	warnedAboutPath = false;
}

/**
 * Windows paths are routinely pasted into settings with their surrounding
 * quotes still attached.
 */
function stripQuotes(input: string): string {
	return input.startsWith('"') && input.endsWith('"') ? input.slice(1, -1).trim() : input;
}

async function warnAboutMissingBinary(): Promise<void> {
	if (warnedAboutPath) {
		return;
	}

	warnedAboutPath = true;

	const choice = await window.showWarningMessage(
		'makensis was not found in your PATH. Install NSIS, or point the extension at an existing compiler.',
		'Open Settings',
		'Download NSIS',
	);

	if (choice === 'Open Settings') {
		await commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis makensis.path');
	} else if (choice === 'Download NSIS') {
		await env.openExternal(Uri.parse('https://nsis.sourceforge.io/Download'));
	}
}
