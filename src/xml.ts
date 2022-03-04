export class XML {
  private xml: string;
  private parseString;
  private output: string[];

  constructor() {
    this.parseString = require('xml2js').parseString;

    const fs = require('fs');
    this.xml = fs.readFileSync("_site/sitemap.xml");

    this.output = [];
  }

  public parse() {
    let x = this.parseString(this.xml, (err: any, result: { props: { property: any[]; }; }) => {
      result.props.property.forEach(prop => {
        prop['$'].required === 'true' &&
        prop['$'].name === 'TemporaryPort' &&
        prop['$'].type === 'input' &&
        this.output.push(prop);
      });
      console.log(this.output);
    });
    return x;
  }
}
