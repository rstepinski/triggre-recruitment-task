import BaseTestWidget from "../base.js";

class BasicContentWidget extends BaseTestWidget {
  previousInnerHTML = "";

  async init() {
    await super.init();
    this.previousInnerHTML = this.target.innerHTML;
    this.target.innerHTML = `
      <div data-widget="base">
        <div data-widget="base"></div>
      </div>
      <div></div>
    `;
  }

  destroy() {
    this.target.innerHTML = this.previousInnerHTML;
    super.destroy();
  }
}

export default BasicContentWidget;
