/**
 * @jest-environment jsdom
 */

import { Widget } from '../Widget';
import { WidgetContainer, WidgetResolveError } from '../WidgetContainer';

class TestWidget extends Widget {
  async init(): Promise<void> {}
  destroy() {}
}

describe('WidgetContainer class', () => {
  it('Should properly resolve and instantiate widgets', async () => {
    const container = new WidgetContainer(async () => TestWidget);
    const widgetInstance = await container.createInstance('test', document.createElement('div'));
    expect(widgetInstance).toBeInstanceOf(TestWidget);
  });

  it('Should throw an error if a widget is not found', async () => {
    const container = new WidgetContainer(async () => {
      throw new Error('test error');
      return TestWidget;
    });

    await expect(
      async () => await container.createInstance('test', document.createElement('div')),
    ).rejects.toBeInstanceOf(WidgetResolveError);
  });
});
