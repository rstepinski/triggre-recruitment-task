import BaseTestWidget from "../base.js";

class NestedContentWidget extends BaseTestWidget {
  previousInnerHTML = "";

  async init() {
    await super.init();
    this.previousInnerHTML = this.target.innerHTML;
    this.target.innerHTML = `
      <div data-widget="content/basic"></div>
      <div></div>
    `;
  }

  destroy() {
    this.target.innerHTML = this.previousInnerHTML;
    super.destroy();
  }
}

export default NestedContentWidget;
