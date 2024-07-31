import { Widget } from './Widget';
import { BaseError } from './BaseError';

type WidgetConstructor = new (...params: ConstructorParameters<typeof Widget>) => Widget;
type WidgetResolver = (widgetIdentifier: string) => Promise<WidgetConstructor>;

export class WidgetContainer {
  #resolvedWidgets: Map<string, WidgetConstructor>;
  #resolver: WidgetResolver;

  constructor(resolver: WidgetResolver) {
    this.#resolvedWidgets = new Map();
    this.#resolver = resolver;
  }

  async #resolve(widgetIdentifier: string) {
    try {
      const widget = await this.#resolver(widgetIdentifier);
      this.#resolvedWidgets.set(widgetIdentifier, widget);
      return widget;
    } catch (e) {
      throw new WidgetResolveError(widgetIdentifier, e);
    }
  }

  async createInstance(widgetIdentifier: string, target: Element): Promise<Widget> {
    const WidgetClass =
      this.#resolvedWidgets.get(widgetIdentifier) ?? (await this.#resolve(widgetIdentifier));
    return new WidgetClass(target);
  }
}

export class WidgetResolveError extends BaseError {
  constructor(widgetIdentifier: string, cause: unknown) {
    super(`Could not resolve widget ${widgetIdentifier}`, { cause });
  }
}
