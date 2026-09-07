import { execFile } from 'node:child_process';
import { isAbsolute, join } from 'node:path';
import { promisify } from 'node:util';
import { type ExtensionContext, workspace } from 'vscode';
import { findOnPath, locate } from './util.ts';

const execFileAsync = promisify(execFile);

export const BINARY_NAME = process.platform === 'win32' ? 'nsis-lsp.exe' : 'nsis-lsp';

export type ServerSource = 'setting' | 'environment' | 'bundled' | 'path';

export type ServerBinary = {
	path: string;
	source: ServerSource;
	version: string;
};

/**
 * Resolves the server binary, in descending order of precedence: the
 * `nsis.serverPath` setting, the `NSIS_LSP_BINARY` environment variable, the
 * binary bundled with this platform-specific build, and finally the `PATH`.
 *
 * Each candidate is probed with `--version` before it is accepted, so that a
 * stale setting or an unrunnable binary falls through to the next candidate
 * instead of failing the client with an opaque spawn error.
 */
export async function resolveServer(context: ExtensionContext): Promise<ServerBinary | undefined> {
	for (const [source, candidate] of candidates(context)) {
		if (!candidate) {
			continue;
		}

		const version = await probe(candidate);

		if (version) {
			return { path: candidate, source, version };
		}
	}

	return undefined;
}

function* candidates(context: ExtensionContext): Generator<[ServerSource, string | undefined]> {
	const configured = workspace.getConfiguration('nsis').get<string>('serverPath', '').trim();

	yield ['setting', configured.length ? locate(configured) : undefined];
	yield ['environment', process.env.NSIS_LSP_BINARY ? locate(process.env.NSIS_LSP_BINARY) : undefined];
	yield ['bundled', context.asAbsolutePath(join('server', BINARY_NAME))];
	yield ['path', findOnPath(BINARY_NAME)];
}

async function probe(binaryPath: string): Promise<string | undefined> {
	if (!isAbsolute(binaryPath)) {
		return undefined;
	}

	try {
		const { stdout } = await execFileAsync(binaryPath, ['--version'], { timeout: 5000 });

		return stdout.trim();
	} catch (error) {
		// A candidate that is simply not there is the normal case for the bundled
		// binary in a server-less build, and not worth reporting.
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.error('[idleberg.nsis]', `Failed to run ${binaryPath} --version`, error);
		}

		return undefined;
	}
}
