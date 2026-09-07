import { dirname, extname, isAbsolute, join } from 'node:path';
import {
	type CancellationToken,
	type Disposable,
	DocumentLink,
	languages,
	Range,
	type TextDocument,
	Uri,
} from 'vscode';
import { getNsisDirectory } from './makensis.ts';
import { fileExists, isWindows } from './util.ts';

/**
 * `!include` takes an arbitrary number of switches (`/NONFATAL`, `/CHARSET=…`)
 * before its argument, `LoadLanguageFile` takes none. Anchoring at the start of
 * the line is what keeps commented-out directives from being linked.
 *
 * The `d` flag is what makes the capture group's own offsets available, so the
 * link can be placed without searching the line for the filename a second time.
 */
const DIRECTIVE_REGEX =
	/^[\t ]*(?:(?<include>!include)(?:[\t ]+\/\w+(?:=\S+)?)*|(?<language>LoadLanguageFile))[\t ]+(?:"(?<double>[^"]+)"|'(?<single>[^']+)'|`(?<backtick>[^`]+)`|(?<bare>[^\s;#]+))/di;

const NSISDIR_REGEX = /\$\{NSISDIR\}/gi;

type Directive = 'include' | 'language';

type Candidate = {
	directive: Directive;
	end: number;
	line: number;
	start: number;
	target: string;
};

export function registerDocumentLinkProvider(): Disposable {
	return languages.registerDocumentLinkProvider(
		{ language: 'nsis' },
		{
			async provideDocumentLinks(document: TextDocument, token: CancellationToken): Promise<DocumentLink[]> {
				// Resolution is relative to the script on disk, so an untitled or
				// virtual document has nothing to resolve against.
				if (document.uri.scheme !== 'file') {
					return [];
				}

				const candidates = collectCandidates(document);

				if (!candidates.length) {
					return [];
				}

				// One `stat` per candidate path, so resolving these in parallel is
				// what keeps a header-heavy script from feeling sluggish.
				const resolved = await Promise.all(
					candidates.map((candidate) => resolveTarget(document.uri.fsPath, candidate)),
				);

				if (token.isCancellationRequested) {
					return [];
				}

				return candidates.flatMap((candidate, index) => {
					const target = resolved[index];

					if (!target) {
						return [];
					}

					const link = new DocumentLink(
						new Range(candidate.line, candidate.start, candidate.line, candidate.end),
						Uri.file(target),
					);

					link.tooltip = target;

					return [link];
				});
			},
		},
	);
}

function collectCandidates(document: TextDocument): Candidate[] {
	const candidates: Candidate[] = [];

	for (let line = 0; line < document.lineCount; line++) {
		const match = DIRECTIVE_REGEX.exec(document.lineAt(line).text);
		const groups = match?.groups;
		const indices = match?.indices?.groups;

		if (!groups || !indices) {
			continue;
		}

		const name = (['double', 'single', 'backtick', 'bare'] as const).find((key) => groups[key]);
		const target = name && groups[name];
		const range = name && indices[name];

		if (!target || !range) {
			continue;
		}

		candidates.push({
			directive: groups.include ? 'include' : 'language',
			end: range[1],
			line,
			start: range[0],
			target,
		});
	}

	return candidates;
}

/**
 * Mirrors how `makensis` itself looks up a file: the script's own directory
 * first, then the compiler's search directories. Getting that order wrong means
 * a header sitting next to the script resolves to NSIS's bundled copy instead.
 */
async function resolveTarget(scriptPath: string, { directive, target }: Candidate): Promise<string | null> {
	const nsisDirectory = await getNsisDirectory();
	let input = normalizeSeparators(target);

	// A plain `includes` rather than a `test`, because the global regex used for
	// the replacement below would carry its `lastIndex` between calls.
	// biome-ignore lint/suspicious/noTemplateCurlyInString: an NSIS define, not a JS template placeholder
	if (input.toUpperCase().includes('${NSISDIR}')) {
		if (!nsisDirectory) {
			return null;
		}

		input = normalizeSeparators(input.replace(NSISDIR_REGEX, nsisDirectory));
	}

	if (isAbsolute(input)) {
		return (await fileExists(input)) ? input : null;
	}

	const searchPaths = [dirname(scriptPath)];

	if (nsisDirectory) {
		searchPaths.push(
			directive === 'language' ? join(nsisDirectory, 'Contrib', 'Language files') : join(nsisDirectory, 'Include'),
		);
	}

	// An extensionless argument is not something makensis accepts, but it is a
	// common enough shorthand in hand-written scripts to be worth following.
	const names = extname(input) ? [input] : [input, `${input}${directive === 'language' ? '.nlf' : '.nsh'}`];

	for (const searchPath of searchPaths) {
		for (const name of names) {
			const candidate = join(searchPath, name);

			if (await fileExists(candidate)) {
				return candidate;
			}
		}
	}

	return null;
}

/**
 * Scripts are written with Windows separators even when they are compiled
 * elsewhere, and `node:path` on POSIX treats a backslash as an ordinary
 * character rather than a separator.
 */
function normalizeSeparators(input: string): string {
	return isWindows() ? input : input.replace(/\\/g, '/');
}
