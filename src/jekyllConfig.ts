import { exit } from 'process';

export class JekyllConfig {
  public hasCollectionsDir: boolean;
  public collectionsDir: string;

  private documentWorkspaceFolder: any;

  constructor(documentWorkspaceFolder: any) {
    this.documentWorkspaceFolder = documentWorkspaceFolder;
    this.collectionsDir = '';

    const yaml = require('js-yaml');
    const fs   = require('fs');

    try {
      const fqConfigName = this.documentWorkspaceFolder() + '/_config.yml';
      const doc = yaml.load(fs.readFileSync(fqConfigName, 'utf8'));
      console.log(doc);
      this.hasCollectionsDir = doc.hasOwnProperty('collections_dir');
      if (this.hasCollectionsDir) {
        console.log("TODO: Figure out how to construct filename for collections_dir");
        this.collectionsDir = doc.collections_dir;
      } else {
        console.log("TODO: Figure out how to construct filename without collections_dir");
      }
      return this;
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }
}
