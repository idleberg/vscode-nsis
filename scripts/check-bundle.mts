#!/usr/bin/env node

/**
 * Guards against a failure that only shows up at runtime: anything left
 * unbundled is missing from the VSIX, because it is packaged with
 * `--no-dependencies`. The extension then fails to activate with a
 * "Cannot find module" error.
 *
 * `vscode` is the one legitimate external — the extension host provides it.
 */

import { readFileSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST_MODULE = 'vscode';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

// Read from `main` rather than hardcoding, so switching the output format does
// not leave this pointed at a file that no longer exists.
const bundle = readFileSync(join(root, pkg.main), 'utf8');

/**
 * Minification drops the space after `from` and rewrites string literals to
 * template literals, so the patterns have to tolerate both. The bundle's format
 * decides which of these actually match — ESM output has no `require` calls,
 * CJS output has no `import` statements — so all four are always checked.
 */
const PATTERNS = [
	/\bfrom\s*["'`]([^"'`]+)["'`]/g, // import … from "x", export … from "x"
	/\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g, // import("x")
	// Anchored to a statement boundary: unanchored, this matches the word
	// `import` inside minified string constants, of which the LSP protocol has
	// several.
	/(?:^|[;\n])\s*import\s*["'`]([^"'`]+)["'`]/gm, // import "x"
	/\brequire\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g, // require("x")
];

const required = new Set<string>();

for (const pattern of PATTERNS) {
	for (const [, specifier] of bundle.matchAll(pattern)) {
		if (specifier) {
			required.add(specifier);
		}
	}
}

// The scanner going blind is the dangerous failure, because it looks like a
// pass. `vscode` is never bundled, so its absence means the patterns above have
// stopped matching how the bundle expresses its imports.
if (!required.has(HOST_MODULE)) {
	console.error(`FAIL: no import of "${HOST_MODULE}" was found in ${pkg.main}, so this check is not working.`);
	console.error('The bundle format probably changed. Update PATTERNS in scripts/check-bundle.mts.');
	process.exit(1);
}

const offenders = [...required].filter((specifier) => specifier !== HOST_MODULE && !isBuiltin(specifier));

if (offenders.length) {
	console.error(`FAIL: ${offenders.join(', ')} is required but not bundled, and will be missing from the VSIX.`);
	console.error('Add it to deps.alwaysBundle in tsdown.config.mts — subpath imports need spelling out in full.');
	process.exit(1);
}

console.log(`OK: externals are ${[...required].sort().join(', ')}`);
