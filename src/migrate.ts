import { ConfigurationTarget, commands, window, workspace } from 'vscode';
import { MIGRATIONS } from './migrations.ts';

// ponytail: only the two scopes a user realistically sets these in. Folder-level
// values are left as they are, and can be added if anyone reports losing one.
const SCOPES = [
	['globalValue', ConfigurationTarget.Global],
	['workspaceValue', ConfigurationTarget.Workspace],
] as const;

/**
 * Rewrites 5.x settings to their 6.0.0 names, since VS Code has no notion of a
 * renamed setting and would otherwise leave the old value stranded while the
 * extension silently reads a default.
 *
 * Settings dropped in 6.0.0 without a replacement are left untouched, so no
 * value disappears without the user deleting it.
 */
export async function migrateSettings(): Promise<string[]> {
	const config = workspace.getConfiguration('nsis');
	const migrated: string[] = [];

	for (const { from, to, map } of MIGRATIONS) {
		const source = config.inspect(from);

		if (!source) {
			continue;
		}

		for (const [property, target] of SCOPES) {
			const value = source[property];

			if (value === undefined) {
				continue;
			}

			const next = map ? map(value) : value;

			if (next === undefined || next === value) {
				continue;
			}

			if (from === to) {
				await config.update(to, next, target);
			} else {
				// A value already set under the new name is the deliberate one, so
				// the old key is only cleared, never allowed to overwrite it.
				if (config.inspect(to)?.[property] === undefined) {
					await config.update(to, next, target);
				}

				await config.update(from, undefined, target);
			}

			migrated.push(from);
		}
	}

	if (migrated.length) {
		window
			.showInformationMessage(
				`NSIS: migrated ${migrated.length} setting${migrated.length === 1 ? '' : 's'} to their 6.0.0 names.`,
				'Open Settings',
			)
			.then((choice) => {
				if (choice === 'Open Settings') {
					void commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.nsis');
				}
			});
	}

	return migrated;
}
