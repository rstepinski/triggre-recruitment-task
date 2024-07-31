import { Widget } from './Widget';
import { BaseError } from './BaseError';
import { WidgetContainer, WidgetResolveError } from './WidgetContainer';

interface ContainerOptions {
  widgetContainer: WidgetContainer;
  widgetAttribute?: string;
}

interface InitializationContext {
  errors: Error[];
}

interface NodeWidget {
  identifier: string;
  widget?: Widget;
  isAborted?: boolean;
  isDone?: boolean;
}

export class WidgetService {
  #container: WidgetContainer;
  #widgetIdentifierAttribute: string;
  #nodeWidgetMap: Map<Element, NodeWidget>;

  constructor({ widgetContainer, widgetAttribute = 'widget' }: ContainerOptions) {
    this.#container = widgetContainer;
    this.#widgetIdentifierAttribute = widgetAttribute;
    this.#nodeWidgetMap = new Map();
  }

  #getIdentifier(target: Element) {
    return target.getAttribute(this.#widgetIdentifierAttribute);
  }

  #discoverWidgets(target: Element) {
    const widgetIdentifier = this.#getIdentifier(target);

    if (widgetIdentifier && !this.#nodeWidgetMap.has(target)) {
      this.#nodeWidgetMap.set(target, { identifier: widgetIdentifier });
    }

    Array.from(target.children).forEach((child) => this.#discoverWidgets(child));
  }

  /**
   * Cleans up widget wrapper objects for yet uninitialized subtree
   * @private
   */
  #cleanupWidgets(target: Element) {
    Array.from(target.children).forEach((child) => this.#cleanupWidgets(child));
    this.#nodeWidgetMap.delete(target);
  }

  #checkIfAborted(target: Element) {
    const nodeWidget = this.#nodeWidgetMap.get(target);
    return !!nodeWidget?.isAborted;
  }

  async #initNode(target: Element, context: InitializationContext) {
    const widgetIdentifier = this.#getIdentifier(target);

    try {
      const nodeWidget = this.#nodeWidgetMap.get(target);
      if (nodeWidget) {
        if (this.#checkIfAborted(target)) {
          this.#cleanupWidgets(target);
          throw new WidgetDestroyedError(nodeWidget.identifier);
        }

        const widget = await this.#container.createInstance(widgetIdentifier, target);
        nodeWidget.widget = widget;

        try {
          await widget.init();
        } catch (e) {
          nodeWidget.isDone = true;
          throw new WidgetInitializationError(widgetIdentifier, e);
        }

        // Abort signal could have come while the widget was initializing, we need to check now.
        if (this.#checkIfAborted(target)) {
          widget.destroy();
          this.#cleanupWidgets(target);
          return;
        }

        // We might need to rediscover if the widget added some content.
        this.#discoverWidgets(target);
      }

      // Initialize subtree
      await Promise.allSettled(
        Array.from(target.children).map(async (child) => await this.#initNode(child, context)),
      );

      if (nodeWidget) {
        // Abort signal could have come while the subtree was initializing, we need to check again.
        if (this.#checkIfAborted(target)) {
          nodeWidget.widget.destroy();
          this.#cleanupWidgets(target);
          throw new WidgetDestroyedError(nodeWidget.identifier);
        }

        // Call lifecycle hook if it is defined.
        if (nodeWidget.widget.afterSubtreeInit) {
          await nodeWidget.widget.afterSubtreeInit();
        }

        nodeWidget.isDone = true;
      }
    } catch (e) {
      if (
        e instanceof WidgetInitializationError ||
        e instanceof WidgetDestroyedError ||
        e instanceof WidgetResolveError
      ) {
        context.errors.push(e);
      } else {
        throw e;
      }
    }
  }

  async init(target: Element, callback?: (context: InitializationContext) => void) {
    const context: InitializationContext = {
      errors: [],
    };

    this.#discoverWidgets(target);
    await this.#initNode(target, context);
    callback && callback(context);
  }

  destroy(target: Element) {
    Array.from(target.children).forEach((target) => this.destroy(target));

    const targetWidget = this.#nodeWidgetMap.get(target);
    if (targetWidget) {
      if (targetWidget.isDone || !targetWidget.widget) {
        targetWidget.widget?.destroy();
        this.#nodeWidgetMap.delete(target);
      } else {
        // If there is .widget defined, and it's not .isDone, it means it's initializing.
        targetWidget.isAborted = true;
      }
    }
  }
}

export class WidgetInitializationError extends BaseError {
  constructor(widgetIdentifier: string, cause: unknown) {
    super(`Could not initialize widget ${widgetIdentifier}`, { cause });
  }
}

export class WidgetDestroyedError extends BaseError {
  constructor(widgetIdentifier: string) {
    super(`Widget ${widgetIdentifier} destroyed before it could be initialized`);
  }
}
