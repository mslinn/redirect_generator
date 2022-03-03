import { exit } from 'process';
import * as vscode from 'vscode';

// permalink: /blog/:year/:month/:day/:title:output_ext
interface JekyllConfig {
  hasCollectionsDir: boolean,
  collectionsDir: string
}

export default class Redirect {
  private editor: vscode.TextEditor;
  private eol: string;
  private jekyllConfig: JekyllConfig;

  constructor(editor: vscode.TextEditor) {
    const os = require("os");
    this.editor = editor;
    this.eol = os.EOL;
    this.jekyllConfig = this.loadJekyllConfig();
  }

  public process(): void {
    // const config = this.loadJekyllConfig();
    const fileNameRelative = this.relativeFileName();
    const text = this.editor.document.getText();
    console.log(`Examining ${fileNameRelative}`);
    let lines = text.split(this.eol);
    if (lines.length>1 && lines[0].startsWith("---")) {
      this.logFrontMatter(lines);
      this.insertRedirect(lines, fileNameRelative);
    } else {
      vscode.window.showErrorMessage(
        "No Jekyll front matter was found in the currently edited file, so no redirect was generated" +
        'See https://jekyllrb.com/docs/front-matter/',
        { modal: true }
      );
    }
  }

  public relativeFileName(): string {
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

  private insertRedirect(lines: string[], fileNameRelative: string): void {
    let linesCopy = Array.from(lines);
    linesCopy.shift();
    const newText = `  - ${fileNameRelative}`;
    const frontMatterEnd: number = linesCopy.findIndex(x => x.startsWith('---'));
    if (this.redirectAlreadyPresent(linesCopy, frontMatterEnd, fileNameRelative)) {
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

  private loadJekyllConfig(): JekyllConfig {
    const yaml = require('js-yaml');
    const fs   = require('fs');

    const config: JekyllConfig = Object.assign({});
    try {
      const fqConfigName = this.documentWorkspaceFolder() + '/_config.yml';
      const doc = yaml.load(fs.readFileSync(fqConfigName, 'utf8'));
      console.log(doc);
      config.hasCollectionsDir = doc.hasOwnProperty('collections_dir');
      if (config.hasCollectionsDir) {
        console.log("TODO: Figure out how to construct filename for collections_dir");
        config.collectionsDir = doc.collections_dir;
      } else {
        console.log("TODO: Figure out how to construct filename without collections_dir");
      }
      return config;
    } catch (e) {
      console.log(e);
      exit(1);
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

  private redirectAlreadyPresent(lines: string[], frontMatterEnd: number, fileNameRelative: string): boolean {
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

  private redirectKeyPresent(lines: string[], frontMatterEnd: number, fileNameRelative: string): boolean {
    const redirectLine: number = lines
                                  .slice(0, frontMatterEnd)
                                  .findIndex( (line) => line.startsWith('redirect_from:'));
    return redirectLine > -1;
  }

  private redirectIndex(frontMatterEnd: number, linesCopy: string[]): number {
    if (frontMatterEnd>=0) {
      for (var _i = 0; _i < frontMatterEnd; _i++) {
        if (linesCopy[_i].startsWith('redirect_from:')) {
          return _i;
        }
      }
    }
    return -1;
  }

  // See https://github.com/nodeca/js-yaml
  private redirectYaml(frontMatterStr: string, newRedirect: string) {
    const yaml = require('js-yaml');

    if (frontMatterStr.length>=0) {
      console.log(`Jekyll front matter is:\n${frontMatterStr}`);
      let frontMatterYaml = yaml.load(frontMatterStr);
      let redirectFrom = frontMatterYaml.redirect_from;
      if (redirectFrom) {
        if (! redirectFrom.contains(newRedirect)) {
          return '';
        } else {
          redirectFrom.insert(newRedirect);
        }
      } else {
        frontMatterYaml.insert('redirect_from', newRedirect);
      }
      const result = yaml.dump(frontMatterYaml, { lineWidth: -1, noCompatMode: true, sortKeys: true });
      return result;
  }
    return yaml.new;
  }
}
