#!/usr/bin/env node

import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

copyFileSync(
	fileURLToPath(import.meta.resolve('@nsis/textmate/grammar.json')),
	new URL('../syntaxes/nsis.json', import.meta.url),
);
