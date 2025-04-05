import type { Range, DiagnosticSeverity } from "vscode";

export type DiagnosticCollection = {
	code?: string;
	message?: string;
	range?: Range;
	severity?: DiagnosticSeverity;
};
