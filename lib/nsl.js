'use babel';

const vscode = require('vscode');

const spawn = require('child_process').spawn;
const outputChannel = vscode.window.createOutputChannel("nsL Assembler");

function transpileCommand (textEditor) {
  let config, customArguments, defaultArguments, doc, nsLJar;

  config = vscode.workspace.getConfiguration('nsis');

  doc = textEditor.document;
  doc.save().then(function () {
    nslJar = config.nsl.pathToJar;

    if (typeof nslJar === "undefined" || nslJar === null) {
      return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
    }

    defaultArguments = ["-jar", nslJar];
    if (config.nsl.customArguments !== null) {
      customArguments = config.nsl.customArguments.trim().split(' ');
    } else {
      customArguments = [ '/nomake', '/nopause' ];
    }
    customArguments.push(doc.fileName);
    const compilerArguments = defaultArguments.concat(customArguments);

    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show(true);
    }
    
    // Let's build
    const nslCmd = spawn("java", compilerArguments);

    let stdErr = "";

    nslCmd.stdout.on('data', (data) => {
      outputChannel.appendLine(data);
    });

    nslCmd.stderr.on('data', (data) => {
      stdErr += "\n" + data;
      outputChannel.appendLine(data);
    });

    nslCmd.on('close', (code) => {
      if (stdErr.length === 0) {
        if (config.showNotifications) vscode.window.showInformationMessage(`Transpiled successfully -- ${doc.fileName}`);
      } else {
        outputChannel.show(true);
        if (config.showNotifications) vscode.window.showErrorMessage("Transpile failed, see output for details");
        console.error(stdErr);
      }
    });
  });
}

module.exports = transpileCommand;
