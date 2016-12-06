'use babel';

const spawn = require('child_process').spawn;
const vscode = require('vscode');

function transpileCommand (textEditor, config) {
  let doc, nsLJar;

  doc = textEditor.document;
  doc.save();

  nslJar = config.nsl.pathToJar;

  if (typeof nslJar === "undefined" || nslJar === null) {
    return vscode.window.showErrorMessage("No valid `nsL.jar` was specified in your config");
  }

  let defaultArguments = ["-jar", nslJar];
  if (config.customArguments != null) {
    customArguments = config.customArguments.trim().join(" ");
  } else {
    compilerArguments = ["/nomake /nopause"];
  }
  customArguments.push(doc.fileName);

  const compilerArguments = defaultArguments.concat(customArguments);

  let outputChannel = vscode.window.createOutputChannel('extension.nsis');
  if (config.alwaysShowOutput === true) {
    outputChannel.show(true);
  } else {
    outputChannel.hide();
  }
  
  // Let's build
  const nslCmd = spawn("java", compilerArguments);

  nslCmd.stdout.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  nslCmd.stderr.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  nslCmd.on('close', (code) => {
    if (code === 0) {
      if (config.showNotifications) vscode.window.showInformationMessage("Successfully transpiled \"" + doc.fileName + "\"");
    } else {
      outputChannel.show(true);
      if (config.showNotifications) vscode.window.showErrorMessage("Transpile failed, see output for details");
    }
  });

  // exec("java -jar \"" + nslJar + "\" " + customArguments + " \"" + doc.fileName + "\"", function(error, stdout, stderr) {
  //   if (error || stderr) {
  //     let message = !stderr ? error : stderr;
  //     console.error(message);
  //     return vscode.window.showErrorMessage("Transpile failed (see console for details)");
  //   } else {
  //     return vscode.window.showInformationMessage("Successfully transpiled \"" + doc.fileName + "\"");
  //   }
  // });
}

module.exports = transpileCommand;
