import { exit } from 'process';

// permalink: /blog/:year/:month/:day/:title:output_ext

export class JekyllConfig {
  public hasCollectionsDir: boolean;
  public collectionsDir: string;

  private hasDocumentWorkspaceFolder: boolean;
  private documentWorkspaceFolder: string;

  constructor(documentWorkspaceFolder: string | undefined) {
    this.hasCollectionsDir = false;
    if (documentWorkspaceFolder) {
      this.hasDocumentWorkspaceFolder = true;
      this.documentWorkspaceFolder = documentWorkspaceFolder;
    } else {
      this.hasDocumentWorkspaceFolder = false;
      this.documentWorkspaceFolder = '.';
      console.log("Caution: this VSCode extension may not work unless a workspace is defined.");
    }
    this.collectionsDir = '';
    this.loadYaml();
  }

  private loadYaml() {
    const yaml = require('js-yaml');
    const fs   = require('fs');
    try {
      const fqConfigName = this.documentWorkspaceFolder + '/_config.yml';
      const doc = yaml.load(fs.readFileSync(fqConfigName, 'utf8'));
      // console.log(doc);
      this.hasCollectionsDir = doc.hasOwnProperty('collections_dir');
      if (this.hasCollectionsDir) {
        console.log("TODO: Figure out how to construct filename for collections_dir");
        this.collectionsDir = doc.collections_dir;
      } else {
        console.log("TODO: Figure out how to construct filename without collections_dir");
      }
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }
}
