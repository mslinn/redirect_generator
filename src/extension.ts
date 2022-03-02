// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function documentWorkspaceFolder(): string | undefined {
	const fileName = vscode.window.activeTextEditor?.document.fileName;
	return vscode.workspace.workspaceFolders
		?.map((folder) => folder.uri.fsPath)
		.filter((fsPath) => fileName?.startsWith(fsPath))[0];
}

function relativeFileName(editor: vscode.TextEditor) {
	const fileName = editor.document.fileName;
	const workspaceFolder = documentWorkspaceFolder();
	let workspaceLen = 0;
	if (workspaceFolder) {
		workspaceLen = workspaceFolder.length
	}
	return fileName.substring(workspaceLen);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "redirect-generator" is active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('redirect-generator.redirectHttp', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Add a redirect from redirect_generator');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const fileNameRelative = relativeFileName(editor);
			const text = editor.document.getText();
			const eol = editor.document.eol;
			console.log(`Examining ${fileNameRelative}`);
			let lines = text.split("\n");
			if (lines.length>1 && lines[0].startsWith("---")) {
				let linesCopy = Array.from(lines);
				linesCopy.shift();
				const frontMatterEnd = linesCopy.findIndex(x => x.startsWith('---'));
				let redirectEntryIndex = -1;
				let lastRedirectIndex = -1;
				if (frontMatterEnd>=0) {
				  console.log("Jekyll front matter is:");
					for (var _i = 0; _i < frontMatterEnd; _i++) {
						// var num = linesCopy[_i];
						console.log(`  ${linesCopy[_i]}`);
						if (linesCopy[_i].startsWith('redirect_from:')) {
							redirectEntryIndex = lastRedirectIndex = _i;
						} else if (redirectEntryIndex>=0 && linesCopy[_i].startsWith('  - ')) {
							lastRedirectIndex = _i;
						}
				  }
					let newText = "";
					if (lastRedirectIndex<0) {
						lastRedirectIndex = 1;
						newText = `redirect_from:\n  - ${fileNameRelative}`;
					} else {
						newText = `  - ${fileNameRelative}`;
					}
					editor.edit(editBuilder => {
						const position = new vscode.Position(lastRedirectIndex, 0);
						editBuilder.insert(position, `${newText}\n`);
					});
				} else {
				  console.log("No front matter was found in the currently edited file.");
				}
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
