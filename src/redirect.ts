import { exit } from 'process';
import * as vscode from 'vscode';

// permalink: /blog/:year/:month/:day/:title:output_ext

export default class Redirect {
  private editor: vscode.TextEditor;

  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  public insertRedirect(lines: string[], fileNameRelative: string) {
    let linesCopy = Array.from(lines);
    linesCopy.shift();
    const frontMatterEnd: number = linesCopy.findIndex(x => x.startsWith('---'));
    let lastRedirectIndex: number = this.scanForRedirect(frontMatterEnd, linesCopy);
    let newText = "";
    if (lastRedirectIndex < 0) {
      lastRedirectIndex = 1;
      newText = `redirect_from:\n  - ${fileNameRelative}`;
    } else {
      newText = `  - ${fileNameRelative}`;
    }
    this.editor.edit(editBuilder => {
      const position = new vscode.Position(lastRedirectIndex, 0);
      editBuilder.insert(position, `${newText}\n`);
    });
  }

  public loadJekyllConfig() {
    const yaml = require('js-yaml');
    const fs   = require('fs');

    try {
      const doc = yaml.load(fs.readFileSync(this.documentWorkspaceFolder() + '/_config.yml', 'utf8'));
      const collectionsDir: string = doc.collections_dir;
      console.log(doc);
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }

  public process() {
    const config = this.loadJekyllConfig();
    const fileNameRelative = this.relativeFileName();
    const text = this.editor.document.getText();
    console.log(`Examining ${fileNameRelative}`);
    let lines = text.split("\n");
    if (lines.length>1 && lines[0].startsWith("---")) {
      this.insertRedirect(lines, fileNameRelative);
    } else {
      console.log("No front matter was found in the currently edited file.");
    }
  }

  public relativeFileName() {
    const fileName = this.editor.document.fileName;
    const workspaceFolder = this.documentWorkspaceFolder();
    let workspaceLen = 0;
    if (workspaceFolder) {
      workspaceLen = workspaceFolder.length;
    }
    return fileName.substring(workspaceLen);
  }


  private documentWorkspaceFolder(): string | undefined {
    const fileName = vscode.window.activeTextEditor?.document.fileName;
    return vscode.workspace.workspaceFolders
      ?.map((folder) => folder.uri.fsPath)
      .filter((fsPath) => fileName?.startsWith(fsPath))[0];
  }

  private scanForRedirect(frontMatterEnd: number, linesCopy: string[]) {
    let lastRedirectIndex: number = -1;
    let redirectEntryIndex: number = -1;
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
    }
    return lastRedirectIndex;
  }
}
