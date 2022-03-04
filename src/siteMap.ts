import { URL } from 'url';

export class SiteMap {
  public urls: string[];

  private documentWorkspaceFolder: string;
  private json: any;
  private xml: string;

  constructor(documentWorkspaceFolder: string | undefined) {
    if (documentWorkspaceFolder) {
      this.documentWorkspaceFolder = documentWorkspaceFolder;
    } else {
      this.documentWorkspaceFolder = '.';
    }

    const fs = require('fs');
    this.xml = fs.readFileSync(`${this.documentWorkspaceFolder}/_site/sitemap.xml`);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
    const parser = new XMLParser();
    this.json = parser.parse(this.xml);
    this.urls = [];
    this.json.urlset.url.forEach((url: { loc: string; }) => {
      this.urls.push(new URL(url.loc).pathname);
    });
  }
}
