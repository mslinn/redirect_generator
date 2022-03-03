import * as vscode from 'vscode';
import { FrontMatter } from './frontMatter';
import { JekyllConfig } from './jekyllConfig';

export default class Redirect extends FrontMatter {
  private jekyllConfig: JekyllConfig;

  constructor(editor: vscode.TextEditor) {
    super(editor);
    this.jekyllConfig = new JekyllConfig(this.documentWorkspaceFolder());
  }

  public process(): void {
    const fileNameRelative = this.relativeFileName();
    const text = this.editor.document.getText();
    console.log(`Examining ${fileNameRelative}`);
    const lines = text.split(this.eol);
    if (lines.length>1 && lines[0].startsWith("---")) {
      this.logFrontMatter(lines);
      super.insertRedirect(lines, fileNameRelative);
    } else {
      vscode.window.showErrorMessage(
        "No Jekyll front matter was found in the currently edited file, so no redirect was generated" +
        'See https://jekyllrb.com/docs/front-matter/',
        { modal: true }
      );
    }
  }

  private logFrontMatter(lines: string[]) {
    const linesCopy = Array.from(lines);
    linesCopy.shift();
    const frontMatterEnd: number = linesCopy.findIndex(x => x.startsWith('---'));
    if (frontMatterEnd>=0) {
      console.log(`Jekyll front matter is:`);
      for (var _i = 0; _i < frontMatterEnd; _i++) {
        console.log(`${(_i+1).toString().padStart(3)}:  ${linesCopy[_i]}`);
      }
    }
  }

  private relativeFileName(): string {
    const fileName = this.editor.document.fileName;
    const workspaceFolder = this.documentWorkspaceFolder();
    let workspaceLen = 0;
    if (workspaceFolder) {
      workspaceLen = workspaceFolder.length;
    }
    return fileName.substring(workspaceLen);
  }
}
