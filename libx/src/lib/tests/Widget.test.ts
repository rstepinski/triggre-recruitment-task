/**
 * @jest-environment jsdom
 */

import { Widget } from '../Widget';

class TestWidget extends Widget {
  onHandle: (instance: Widget) => void;

  constructor(element: Element, onHandle: (instance: Widget) => void) {
    super(element);
    this.onHandle = onHandle;
  }

  async init(): Promise<void> {
    this.target.addEventListener('testEvent', this.testHandler);
  }

  destroy(): void {}

  testHandler() {
    this.onHandle(this);
  }
}

describe('Widget class', () => {
  it('should correctly proxy this on handlers', () => {
    const element = document.createElement('div');
    const mockFn = jest.fn((i: Widget) => {});
    const widget = new TestWidget(element, mockFn);
    widget.init();
    const testEvent = new CustomEvent('testEvent');

    element.dispatchEvent(testEvent);
    expect(mockFn).toHaveBeenCalledWith(widget);
  })
})