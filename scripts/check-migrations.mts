/**
 * Checks the 6.0.0 settings migration table against the manifest and the last
 * 5.x manifest, so a typo in either half of a rename fails the build instead of
 * silently doing nothing on a user's machine.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MIGRATIONS } from '../src/migrations.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The last 5.x release, whose settings the table migrates away from. */
const BASELINE = 'v5.6.9';

function settingsOf(manifest: string): Set<string> {
	const { contributes } = JSON.parse(manifest);
	const configuration = contributes.configuration;
	const properties = Array.isArray(configuration)
		? Object.assign({}, ...configuration.map((entry: { properties: unknown }) => entry.properties))
		: configuration.properties;

	return new Set(Object.keys(properties).map((key) => key.replace(/^nsis\./, '')));
}

const current = settingsOf(readFileSync(join(root, 'package.json'), 'utf8'));
const previous = settingsOf(execFileSync('git', ['show', `${BASELINE}:package.json`], { cwd: root, encoding: 'utf8' }));

for (const { from, to, map } of MIGRATIONS) {
	assert.ok(previous.has(from), `migration source "${from}" was not a setting in ${BASELINE}`);
	assert.ok(current.has(to), `migration target "${to}" is not a setting in package.json`);

	if (from !== to) {
		assert.ok(!current.has(from), `"${from}" still exists, so renaming it to "${to}" would strand the old value`);
	} else {
		assert.ok(map, `"${from}" migrates onto itself but has no map, so it would never change anything`);
	}
}

// Every 5.x setting that is gone should either migrate or be a deliberate drop.
const DROPPED = new Set([
	'diagnostics.overrideCompression',
	'diagnostics.excludedFiles',
	'diagnostics.useCustomArguments',
	'diagnostics.customArguments',
	'muteANSIDeprecationWarning',
	'formatter.indentSize',
	'formatter.useTabs',
]);

const sources = new Set(MIGRATIONS.map(({ from }) => from));

for (const setting of previous) {
	if (current.has(setting) || sources.has(setting) || DROPPED.has(setting)) {
		continue;
	}

	assert.fail(`"${setting}" vanished in 6.0.0 without a migration or an entry in DROPPED`);
}

// The value maps, which are the part a rename alone would not catch.
const mapOf = (from: string) => MIGRATIONS.find((migration) => migration.from === from)?.map;

assert.equal(mapOf('compiler.pathToMakensis')?.('makensis'), '', 'the old PATH sentinel should become an empty string');
assert.equal(
	mapOf('compiler.pathToMakensis')?.('/usr/bin/makensis'),
	'/usr/bin/makensis',
	'a real path should survive',
);
assert.equal(mapOf('diagnostics.preprocessMode')?.('PPO'), 'ppo');
assert.equal(mapOf('diagnostics.preprocessMode')?.('Safe PPO'), 'safe_ppo');
assert.equal(mapOf('diagnostics.preprocessMode')?.('(none)'), 'none');
assert.equal(mapOf('diagnostics.preprocessMode')?.('ppo'), undefined, 'an already-migrated value should be left alone');
assert.equal(mapOf('compiler.verbosity')?.('-1'), '(default)');
assert.equal(mapOf('compiler.verbosity')?.('3'), undefined, 'a still-valid verbosity should be left alone');

console.log(`OK: ${MIGRATIONS.length} settings migrations agree with package.json and ${BASELINE}`);
