import type { SpawnOptions } from 'node:child_process';
import { platform } from 'node:os';
import { workspace } from 'vscode';

const PLATFORM = platform();

export async function getSpawnEnv(): Promise<SpawnOptions['env']> {
	const { integrated } = workspace.getConfiguration('terminal');
	const mappedPlatform = mapPlatform();

	return {
		// start with calling process env (this provides e.g. %PATH% on Windows)
		...process.env,

		// NSIS related
		NSISDIR: integrated.env[mappedPlatform].NSISDIR || process.env.NSISDIR || undefined,
		NSISCONFDIR: integrated.env[mappedPlatform].NSISCONFDIR || process.env.NSISCONFDIR || undefined,

		// language settings, fixes occasional issues on macOS and Linux
		LANG: !isWindows() && !process.env.LANGUAGE ? 'en_US.UTF-8' : undefined,
		LANGUAGE: !isWindows() && !process.env.LANGUAGE ? 'en_US.UTF-8' : undefined,
		LC_ALL: !isWindows() && !process.env.LC_ALL ? 'en_US.UTF-8' : undefined,
	};
}

export function isWindows(): boolean {
	return PLATFORM === 'win32';
}

export function mapPlatform(): string {
	switch (PLATFORM) {
		case 'darwin':
			return 'osx';

		case 'win32':
			return 'windows';

		default:
			return PLATFORM;
	}
}
