import { defineConfig } from 'tsup';

export default defineConfig({
	bundle: true,
	clean: true,
	entry: ['src/index.ts'],
	external: ['vscode'],
	format: 'cjs',
	minify: true,
	noExternal: ['dot-prop'],
	target: 'es2020',
	outDir: 'lib',
});
