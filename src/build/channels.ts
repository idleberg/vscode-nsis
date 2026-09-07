import { type OutputChannel, window } from 'vscode';

let compilerChannel: OutputChannel | undefined;
let infoChannel: OutputChannel | undefined;

/**
 * Carries the compiler's own output, highlighted by the `makensis` grammar this
 * extension contributes.
 */
export function getCompilerChannel(): OutputChannel {
	compilerChannel ??= window.createOutputChannel('NSIS Compiler', 'makensis');

	return compilerChannel;
}

/**
 * Carries the answers to the informational commands — version, compiler flags —
 * so they do not scroll the build log away.
 */
export function getInfoChannel(): OutputChannel {
	infoChannel ??= window.createOutputChannel('NSIS Info', 'json');

	return infoChannel;
}

/**
 * The channels are created on first use rather than on activation, so an
 * installation that never compiles anything does not grow two empty entries in
 * the output panel.
 */
export function disposeChannels(): void {
	compilerChannel?.dispose();
	infoChannel?.dispose();

	compilerChannel = undefined;
	infoChannel = undefined;
}
