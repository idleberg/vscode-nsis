export type DiagnosticCollection = {
  code?: string;
  message?: string;
  range?: vscode.Range;
  severity?: vscode.DiagnosticSeverity;
}