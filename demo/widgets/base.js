import { Widget } from "../lib/libx/index.js";

class BaseTestWidget extends Widget {
  constructor(target) {
    super(target);
    this.target.dataset.state = 'instantiated';
    this.target.dataset.initCount = '0';
    this.target.dataset.destroyCount = '0';
  }

  async init() {
    this.target.dataset.initCount++;
    if (this.target.dataset.willFail != null) {
      throw new Error('failed');
    }
    this.target.dataset.state = 'initialized';
  }

  async afterSubtreeInit() {
    this.target.dataset.state = 'done';
  }

  destroy() {
    this.target.dataset.destroyCount++;
    delete this.target.dataset.state;
  }
}

export default BaseTestWidget;
