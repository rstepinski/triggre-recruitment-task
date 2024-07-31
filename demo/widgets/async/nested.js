import BaseTestWidget from "../base.js";

class NestedAsyncWidget extends BaseTestWidget {
  previousInnerHTML = "";

  async init() {
    await super.init();
    this.previousInnerHTML = this.target.innerHTML;
    this.target.innerHTML = "loading...";
    await new Promise((res) => setTimeout(res, 2000));
    this.target.innerHTML = `
      <div data-widget="base"></div>
      <div data-widget="async/basic"></div>
    `;
  }

  async afterSubtreeInit() {
    const loaded = document.createElement('div');
    loaded.innerText = 'subtree loaded';
    this.target.appendChild(loaded);
    await super.afterSubtreeInit();
  }

  destroy() {
    this.target.innerHTML = this.previousInnerHTML;
    super.destroy();
  }
}

export default NestedAsyncWidget;
