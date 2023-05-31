// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";

function showMessage(message: string) {
  vscode.window.setStatusBarMessage(message,1000);
}

function isUnityProject(): boolean {
  if (vscode.workspace.workspaceFolders) {
    let workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let assetsPath = path.join(workspaceRoot, "Assets");
    let projectSettingsPath = path.join(workspaceRoot, "ProjectSettings");
    return fs.existsSync(assetsPath) && fs.existsSync(projectSettingsPath);
  }
  return false;
}

function unityCompile() {
  let port = vscode.workspace
    .getConfiguration("unity-auto-compile")
    .get("port");
  http.get("http://127.0.0.1:" + port + "/refresh", (res) => {});
  showMessage("Unity Compiled");
}

export function activate(context: vscode.ExtensionContext) {

  let onSave = vscode.workspace.onDidSaveTextDocument((document) => {
    let enabled = vscode.workspace
      .getConfiguration("unity-auto-compile")
      .get("enabled");
    if (enabled&&isUnityProject()) {
      unityCompile();
    }
  });

  context.subscriptions.push(onSave);

  let forceCompile = vscode.commands.registerCommand(
    "unity-auto-compile.compile",
    () => {
      unityCompile();
    }
  );
  context.subscriptions.push(forceCompile);

  let toggleCommand = vscode.commands.registerCommand(
    "unity-auto-compile.toggle",
    () => {
      let enabled = vscode.workspace
        .getConfiguration("unity-auto-compile")
        .get("enabled");
      vscode.workspace
        .getConfiguration("unity-auto-compile")
        .update("enabled", !enabled);
      showMessage("Unity Background Compilation: " + (!enabled ? "ON" : "OFF"));
    }
  );

  context.subscriptions.push(toggleCommand);
}

export function deactivate() {}