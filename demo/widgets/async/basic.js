import BaseTestWidget from "../base.js";

class BasicAsyncWidget extends BaseTestWidget {
  previousInnerHTML = "";

  async init() {
    await super.init();
    this.previousInnerHTML = this.target.innerHTML;
    this.target.innerHTML = 'loading...'
    await new Promise(res => setTimeout(res, 2000));
    this.target.innerHTML = `
      <div></div>
      <div data-widget="base"></div>
    `;
  }

  destroy() {
    this.target.innerHTML = this.previousInnerHTML;
    super.destroy();
  }
}

export default BasicAsyncWidget;
