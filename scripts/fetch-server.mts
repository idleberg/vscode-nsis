#!/usr/bin/env node

/**
 * Downloads the `nsis-lsp` binary for a given VS Code target and drops it into
 * `server/`, ready for `vsce package --target <target>`.
 *
 * The binaries come from the per-platform npm packages that the nsis-lsp release
 * workflow publishes, pinned to the `nsisLspVersion` field in package.json.
 *
 * Usage:
 *   node scripts/fetch-server.mts --target darwin-arm64
 *   node scripts/fetch-server.mts             (defaults to the current machine)
 */

import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** VS Code target → npm package suffix. */
const TARGETS: Record<string, string> = {
	'darwin-arm64': 'darwin-arm64',
	'darwin-x64': 'darwin-x64',
	'linux-arm64': 'linux-arm64',
	'linux-x64': 'linux-x64',
	'alpine-arm64': 'linux-arm64-musl',
	'alpine-x64': 'linux-x64-musl',
	'win32-arm64': 'win32-arm64',
	'win32-x64': 'win32-x64',
};

function currentTarget(): string {
	const arch = process.arch === 'arm64' ? 'arm64' : 'x64';

	return `${process.platform}-${arch}`;
}

function parseArgs(argv: string[]): string {
	const index = argv.indexOf('--target');

	return index === -1 ? currentTarget() : (argv[index + 1] ?? '');
}

function main() {
	const target = parseArgs(process.argv.slice(2));
	const suffix = TARGETS[target];

	if (!suffix) {
		console.error(`Unsupported target: ${target}\nSupported: ${Object.keys(TARGETS).join(', ')}`);
		process.exit(1);
	}

	const { nsisLspVersion } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

	if (!nsisLspVersion) {
		console.error('package.json is missing the "nsisLspVersion" field');
		process.exit(1);
	}

	const spec = `@nsis/lsp-${suffix}@${nsisLspVersion}`;
	const binaryName = target.startsWith('win32') ? 'nsis-lsp.exe' : 'nsis-lsp';
	const staging = mkdtempSync(join(tmpdir(), 'nsis-lsp-'));

	console.log(`Fetching ${spec} for ${target}`);

	try {
		// `npm pack` resolves the registry, auth and proxy config for us; the
		// tarball always unpacks into a `package/` directory.
		const tarball = execFileSync('npm', ['pack', spec, '--silent', '--pack-destination', staging], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'inherit'],
		})
			.trim()
			.split('\n')
			.pop();

		if (!tarball) {
			throw new Error(`npm pack ${spec} did not report a tarball`);
		}

		execFileSync('tar', ['-xzf', join(staging, tarball), '-C', staging], { stdio: 'inherit' });

		const source = join(staging, 'package', binaryName);

		if (!existsSync(source)) {
			throw new Error(`${spec} does not contain ${binaryName}`);
		}

		const serverDir = join(ROOT, 'server');
		mkdirSync(serverDir, { recursive: true });

		const destination = join(serverDir, binaryName);
		copyFileSync(source, destination);
		chmodSync(destination, 0o755);

		console.log(`Wrote ${destination}`);
	} finally {
		rmSync(staging, { force: true, recursive: true });
	}
}

main();
