// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Redirect from './redirect';

// This method is called when the extension is activated
// The extension is activated the first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "redirect-generator" is active');

	// The command has been defined in the package.json file
	// The implementation of the command is defined by registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('redirect-generator.redirectHttp', () => {
		// This code is executed every time the command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			console.log(
				"redirect_generator will attempt to add an HTTP redirect into this page's Jekyll front matter."
			);
			new Redirect(editor).process();
		} else {
			vscode.window.showWarningMessage(
				"Please select an editor window containing a Jekyll website's HTML" +
				" page so redirect_generator can insert an HTTP redirect into the Jekyll front matter."
			);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when the extension is deactivated
export function deactivate() {}
