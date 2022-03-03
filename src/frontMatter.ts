import * as vscode from 'vscode';

export class FrontMatter {
  public editor: vscode.TextEditor;
  public eol: string;

  constructor(editor: vscode.TextEditor) {
    const os = require("os");
    this.editor = editor;
    this.eol = os.EOL;
  }

  public documentWorkspaceFolder(): string | undefined {
    const fileName = vscode.window.activeTextEditor?.document.fileName;
    return vscode.workspace.workspaceFolders
      ?.map((folder) => folder.uri.fsPath)
      .filter((fsPath) => fileName?.startsWith(fsPath))[0];
  }

  public insertRedirect(lines: string[], fileNameRelative: string): void {
    let linesCopy = Array.from(lines);
    linesCopy.shift();
    const newText = `  - ${fileNameRelative}`;
    const frontMatterEnd: number = linesCopy.findIndex(x => x.startsWith('---'));
    if (this.redirectValuePresent(linesCopy, frontMatterEnd, fileNameRelative)) {
      vscode.window.showInformationMessage(
        `${fileNameRelative} is already present in the list of redirect_from items`,
        { modal: true }
      );
    } else {
      this.editor.edit(editBuilder => {
        const nextLineNumber: number = this.nextRedirectIndex(linesCopy, frontMatterEnd);
        let position = new vscode.Position(nextLineNumber, 0);
        if (!this.redirectKeyPresent(linesCopy, frontMatterEnd, fileNameRelative)) {
          editBuilder.insert(position, 'redirect_from:' + this.eol);
        }
        editBuilder.insert(position, `${newText}${this.eol}`);
      });
    }
  }

  private nextRedirectIndex(lines: string[], frontMatterEnd: number): number {
    let lastRedirectIndex: number = -1;
    let redirectEntryIndex: number = -1;
    let processingRedirects: boolean = false;
    let foundRedirectFrom: boolean = false;
    if (frontMatterEnd>=0) {
      for (var _i = 0; _i < frontMatterEnd; _i++) {
        if (lines[_i].startsWith('redirect_from:')) {
          redirectEntryIndex = lastRedirectIndex = _i;
          foundRedirectFrom = processingRedirects = true;
        } else if (processingRedirects) {
          if (lines[_i].startsWith('  - ')) {
            lastRedirectIndex = _i;
          } else {
            processingRedirects = false;
          }
        }
      }
      if (!foundRedirectFrom) {
        return frontMatterEnd + 1;
      }
      return lastRedirectIndex + 2;
    } else {
      return -1;
    }
  }

  private redirectKeyPresent(lines: string[], frontMatterEnd: number, fileNameRelative: string): boolean {
    const redirectLine: number = lines
                                  .slice(0, frontMatterEnd)
                                  .findIndex( (line) => line.startsWith('redirect_from:'));
    return redirectLine > -1;
  }

  private redirectValuePresent(lines: string[], frontMatterEnd: number, fileNameRelative: string): boolean {
    const redirectLine: number = lines
                                  .slice(0, frontMatterEnd)
                                  .findIndex( (line) => line.startsWith('redirect_from:'));
    if (redirectLine>=0) {
      for (var _i = redirectLine+1; _i < frontMatterEnd; _i++) {
        const line = lines[_i];
        if (!line.startsWith("  - ")) {
          return false;
        }
        const fileName = line.replace('  - ', '');
        if (fileName === fileNameRelative) {
          return true;
        }
      }
    }
    return false;
  }
}
