import { exit } from 'process';
import * as vscode from 'vscode';
import { FrontMatter } from './FrontMatter';

// permalink: /blog/:year/:month/:day/:title:output_ext
export interface JekyllConfig {
  hasCollectionsDir: boolean,
  collectionsDir: string
}

export default class Redirect extends FrontMatter {
  private jekyllConfig: JekyllConfig;

  constructor(editor: vscode.TextEditor) {
    super(editor);
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
      super.insertRedirect(lines, fileNameRelative);
    } else {
      vscode.window.showErrorMessage(
        "No Jekyll front matter was found in the currently edited file, so no redirect was generated" +
        'See https://jekyllrb.com/docs/front-matter/',
        { modal: true }
      );
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
