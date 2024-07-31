import BaseTestWidget from "./base.js";

class ManualDoneWidget extends BaseTestWidget {
  previousInnerHTML = "";
  donePromise;

  async init() {
    await super.init();
    this.previousInnerHTML = this.target.innerHTML;
    const button = document.createElement('button');
    button.innerText = 'done!'
    this.donePromise = new Promise((resolve) => {
      button.addEventListener('click', () => resolve());
    });
    this.target.replaceChildren(button);
  }

  async afterSubtreeInit() {
    await this.donePromise;
    await super.afterSubtreeInit();
  }

  destroy() {
    this.target.innerHTML = this.previousInnerHTML;
    super.destroy();
  }
}

export default ManualDoneWidget;
