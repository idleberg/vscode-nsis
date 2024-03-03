import { defineConfig } from 'tsup';

export default defineConfig({
	bundle: true,
	clean: true,
	entry: ['src/index.ts'],
	external: ['vscode'],
	format: 'cjs',
	minify: true,
	noExternal: ['makensis', 'micromatch', 'open', 'vscode-get-config', 'which'],
	target: 'es2020',
	outDir: 'lib',
});
