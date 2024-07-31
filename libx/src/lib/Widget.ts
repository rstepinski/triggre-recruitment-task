export abstract class Widget {
  constructor(protected target: Element) {
    return new Proxy(this, bindThisHandler);
  }

  abstract init(): Promise<void>;
  abstract destroy(): void;
  afterSubtreeInit?(): Promise<void>;
}

const bindThisHandler: ProxyHandler<Widget> = {
  get(target, prop) {
    if (
      typeof prop === 'string' &&
      prop.endsWith('Handler') &&
      prop in target &&
      typeof target[prop as keyof typeof target] === 'function'
    ) {
      return (target[prop as keyof typeof target] as () => unknown).bind(target);
    }

    return target[prop as keyof typeof target];
  },
};
