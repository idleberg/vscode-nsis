import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	entry: ['src/index.ts'],
	external: ['vscode'],
	format: 'cjs',
	inlineOnly: false,
	minify: true,
	noExternal: ['@nsis/nlf', 'makensis', 'micromatch', 'open', 'vscode-get-config', 'which'],
	outDir: 'lib',
	platform: 'node',
	target: 'es2020',
	treeshake: true,
});
