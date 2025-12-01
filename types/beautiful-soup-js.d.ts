declare module "beautiful-soup-js" {
  class BeautifulSoup {
    constructor(html: string);
    findAll(tag: string): any[];
    getText(): string;
  }

  export default BeautifulSoup;
}


