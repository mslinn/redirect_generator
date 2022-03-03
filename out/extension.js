"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const redirect_1 = require("./redirect");
// This method is called when the extension is activated
// The extension is activated the first time the command is executed
function activate(context) {
    console.log('Extension "redirect-generator" is active');
    // The command has been defined in the package.json file
    // The implementation of the command is defined by registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('redirect-generator.redirectHttp', () => {
        // This code is executed every time the command is executed
        vscode.window.showInformationMessage('Add a redirect from redirect_generator');
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const redirect = new redirect_1.default(editor);
            redirect.process();
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when the extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map