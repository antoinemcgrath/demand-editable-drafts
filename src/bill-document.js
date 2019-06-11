import TextLayoutAnalyzer from './text-layout-analyzer.js';

// This class wraps and controls a `pdfjs` document and it's canvas.
class BillDocument {
  constructor(pdf, options={}){
    this.pdf               = pdf;
    this.scale             = (options.scale || 1);
    this.pageCount         = this.pdf.numPages;
    this.currentPageNumber = 1;
  }

  async init() {
    await this.getPage(this.currentPageNumber);
  }

  async getPage(pageNumber) {
    if (pageNumber > 0 && pageNumber <= this.pageCount) {
      return await this.pdf.getPage(pageNumber);
    } else { throw "pageNumber must be within the range of 1 to pageCount."; }
  }

  async calculateLayout() {
    let pageData = [];
    for (let pageNumber = 1; pageNumber <= this.pageCount ; pageNumber++) {
      let page = await this.getPage(pageNumber);
      let viewport = page.getViewport({scale:1});
      let canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width  = viewport.width;
      let context = canvas.getContext('2d');
      let textItems = await page.getTextContent({normalizeWhiteSpace: true});
      let analyzer = new TextLayoutAnalyzer(textItems, viewport, context);
      analyzer.calculateStyles();
      analyzer.findWhiteSpace();
      analyzer.groupRegions();
      pageData.push(analyzer.region);
    }
    return pageData;
  }

  async dumpBillText() {
    let pages = await this.calculateLayout();
    return pages.reduce((texts,p)=>{
      texts.push(p.getText()); 
      return texts;
    }, []).join("\n----------------\n");
  }
}

class BillPage {
  constructor(pdf, num){

  }
}

export default BillDocument;