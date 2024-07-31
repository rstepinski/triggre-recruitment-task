declare abstract class Widget {
    protected target: Element;
    constructor(target: Element);
    abstract init(): Promise<void>;
    abstract destroy(): void;
    afterSubtreeInit?(): Promise<void>;
}

type WidgetConstructor = new (...params: ConstructorParameters<typeof Widget>) => Widget;
type WidgetResolver = (widgetIdentifier: string) => Promise<WidgetConstructor>;
declare class WidgetContainer {
    #private;
    constructor(resolver: WidgetResolver);
    createInstance(widgetIdentifier: string, target: Element): Promise<Widget>;
}

interface ContainerOptions {
    widgetContainer: WidgetContainer;
    widgetAttribute?: string;
}
interface InitializationContext {
    errors: Error[];
}
declare class WidgetService {
    #private;
    constructor({ widgetContainer, widgetAttribute }: ContainerOptions);
    init(target: Element, callback?: (context: InitializationContext) => void): Promise<void>;
    destroy(target: Element): void;
}

declare const _default: {
    WidgetService: typeof WidgetService;
    WidgetContainer: typeof WidgetContainer;
    Widget: typeof Widget;
};

export { Widget, WidgetContainer, WidgetService, _default as default };
