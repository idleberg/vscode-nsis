import { accessSync, constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { platform } from 'node:os';
import { delimiter, join, resolve } from 'node:path';

export function isWindows(): boolean {
	return platform() === 'win32';
}

/**
 * The name `terminal.integrated.env` uses for the current platform, which is
 * neither `process.platform` nor `os.platform()`.
 */
export function mapPlatform(): 'osx' | 'windows' | 'linux' {
	switch (platform()) {
		case 'darwin':
			return 'osx';

		case 'win32':
			return 'windows';

		default:
			return 'linux';
	}
}

export async function fileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath, constants.F_OK);

		return true;
	} catch {
		return false;
	}
}

/**
 * Turns whatever the user configured into an absolute path. A bare command name
 * is looked up on the `PATH`, so `"nsis-lsp"` keeps working as a setting instead
 * of resolving against an arbitrary working directory.
 */
export function locate(input: string): string | undefined {
	const home = process.env.HOME ?? process.env.USERPROFILE;

	if (input.startsWith('~/') && home) {
		return join(home, input.slice(2));
	}

	if (input.includes('/') || input.includes('\\')) {
		return resolve(input);
	}

	return findOnPath(input);
}

/**
 * A `which`, minus the dependency. Windows needs the `PATHEXT` dance because
 * `nsis-lsp.exe` is only one of several names the shell would have accepted.
 */
export function findOnPath(binaryName: string): string | undefined {
	const paths = (process.env.PATH ?? '').split(delimiter).filter(Boolean);
	const extensions =
		process.platform === 'win32' ? (process.env.PATHEXT ?? '.EXE').split(delimiter).filter(Boolean) : [''];

	for (const directory of paths) {
		for (const extension of extensions) {
			const candidate = join(directory, binaryName.replace(/\.exe$/i, '') + extension);

			try {
				accessSync(candidate, constants.X_OK);

				return candidate;
			} catch {
				// Not here, try the next one.
			}
		}
	}

	return undefined;
}
