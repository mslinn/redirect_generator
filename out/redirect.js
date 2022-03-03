"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("process");
const vscode = require("vscode");
// permalink: /blog/:year/:month/:day/:title:output_ext
class Redirect {
    constructor(editor) {
        this.editor = editor;
    }
    insertRedirect(lines, fileNameRelative) {
        let linesCopy = Array.from(lines);
        linesCopy.shift();
        const frontMatterEnd = linesCopy.findIndex(x => x.startsWith('---'));
        let lastRedirectIndex = this.scanForRedirect(frontMatterEnd, linesCopy);
        let newText = "";
        if (lastRedirectIndex < 0) {
            lastRedirectIndex = 1;
            newText = `redirect_from:\n  - ${fileNameRelative}`;
        }
        else {
            newText = `  - ${fileNameRelative}`;
        }
        this.editor.edit(editBuilder => {
            const position = new vscode.Position(lastRedirectIndex, 0);
            editBuilder.insert(position, `${newText}\n`);
        });
    }
    loadJekyllConfig() {
        const yaml = require('js-yaml');
        const fs = require('fs');
        try {
            const doc = yaml.load(fs.readFileSync(this.documentWorkspaceFolder() + '/_config.yml', 'utf8'));
            const collectionsDir = doc.collections_dir;
            console.log(doc);
        }
        catch (e) {
            console.log(e);
            (0, process_1.exit)(1);
        }
    }
    process() {
        const config = this.loadJekyllConfig();
        const fileNameRelative = this.relativeFileName();
        const text = this.editor.document.getText();
        console.log(`Examining ${fileNameRelative}`);
        let lines = text.split("\n");
        if (lines.length > 1 && lines[0].startsWith("---")) {
            this.insertRedirect(lines, fileNameRelative);
        }
        else {
            console.log("No front matter was found in the currently edited file.");
        }
    }
    relativeFileName() {
        const fileName = this.editor.document.fileName;
        const workspaceFolder = this.documentWorkspaceFolder();
        let workspaceLen = 0;
        if (workspaceFolder) {
            workspaceLen = workspaceFolder.length;
        }
        return fileName.substring(workspaceLen);
    }
    documentWorkspaceFolder() {
        const fileName = vscode.window.activeTextEditor?.document.fileName;
        return vscode.workspace.workspaceFolders
            ?.map((folder) => folder.uri.fsPath)
            .filter((fsPath) => fileName?.startsWith(fsPath))[0];
    }
    scanForRedirect(frontMatterEnd, linesCopy) {
        let lastRedirectIndex = -1;
        let redirectEntryIndex = -1;
        if (frontMatterEnd >= 0) {
            console.log("Jekyll front matter is:");
            for (var _i = 0; _i < frontMatterEnd; _i++) {
                // var num = linesCopy[_i];
                console.log(`  ${linesCopy[_i]}`);
                if (linesCopy[_i].startsWith('redirect_from:')) {
                    redirectEntryIndex = lastRedirectIndex = _i;
                }
                else if (redirectEntryIndex >= 0 && linesCopy[_i].startsWith('  - ')) {
                    lastRedirectIndex = _i;
                }
            }
        }
        return lastRedirectIndex;
    }
}
exports.default = Redirect;
//# sourceMappingURL=redirect.js.map