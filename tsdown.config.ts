import { defineConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
	clean: true,
	deps: {
		// The subpath needs spelling out, the bare name alone leaves it external.
		alwaysBundle: [...Object.keys(pkg.dependencies), 'vscode-languageclient/node'],
		neverBundle: ['vscode'],
		onlyBundle: false,
	},
	entry: ['src/index.ts'],
	format: 'esm',
	minify: true,
	outDir: 'lib',
	platform: 'node',
	target: 'es2020',
	treeshake: true,
});
