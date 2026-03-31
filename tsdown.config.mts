import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	deps: {
		alwaysBundle: ['@nsis/dent', '@nsis/nlf', 'makensis', 'micromatch', 'open', 'vscode-get-config', 'which'],
		neverBundle: ['vscode'],
		onlyBundle: false,
	},
	entry: ['src/index.ts'],
	format: 'esm',
	minify: true,
	outDir: 'lib',
	platform: 'node',
	target: 'node20',
	treeshake: true,
});
