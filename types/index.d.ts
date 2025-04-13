import type { DiagnosticSeverity, Range } from 'vscode';

export type DiagnosticCollection = {
	code?: string;
	message?: string;
	range?: Range;
	severity?: DiagnosticSeverity;
};
