export type Migration = {
	from: string;
	to: string;
	/** Returns `undefined` to leave the stored value alone. */
	map?: (value: unknown) => unknown;
};

/**
 * Settings renamed or revalued in 6.0.0. Entries where `from` equals `to` keep
 * the key and only fix a value that is no longer part of its enum.
 *
 * Kept apart from `migrate.ts` so it can be checked against `package.json`
 * without pulling in the editor API.
 */
export const MIGRATIONS: Migration[] = [
	// `makensis` was the old default and meant "find it on the PATH", which an
	// empty string now means.
	{ from: 'compiler.pathToMakensis', to: 'makensis.path', map: (value) => (value === 'makensis' ? '' : value) },
	{ from: 'processHeaders', to: 'compiler.processHeaders' },
	{ from: 'showNotifications', to: 'compiler.showNotifications' },
	{ from: 'showOutputView', to: 'compiler.showOutputView' },
	{ from: 'showFlagsAsObject', to: 'compiler.showFlagsAsObject' },
	{ from: 'showVersionAsInfoMessage', to: 'compiler.showVersionAsInfoMessage' },
	{ from: 'alwaysOpenBuildTask', to: 'buildTask.openAfterCreation' },
	{ from: 'diagnostics.enableDiagnostics', to: 'diagnostics.enabledOnSave' },
	{
		from: 'diagnostics.preprocessMode',
		to: 'diagnostics.preprocessMode',
		map: (value) => ({ PPO: 'ppo', 'Safe PPO': 'safe_ppo', '(none)': 'none' })[String(value)],
	},
	{
		from: 'compiler.verbosity',
		to: 'compiler.verbosity',
		map: (value) => (value === '-1' ? '(default)' : undefined),
	},
];
