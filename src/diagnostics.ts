import * as vscode from 'vscode';
import * as makensis from 'makensis';

const updateDiagnostics = (document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void => {
  if (document && document.languageId === 'nsis') {
    console.log( makensis.compileSync(document.fileName, {verbose: 2}));

    collection.set(document.uri, [{
      code: '',
      message: 'cannot assign twice to immutable variable `x`',
      range: new vscode.Range(new vscode.Position(3, 4), new vscode.Position(3, 10)),
      severity: vscode.DiagnosticSeverity.Error
    }]);
  } else {
    collection.clear();
  }
};

export {
  updateDiagnostics
};
