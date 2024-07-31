var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/lib/BaseError.ts
var BaseError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = this.constructor.name;
  }
};

// src/lib/WidgetContainer.ts
var _resolvedWidgets, _resolver, _WidgetContainer_instances, resolve_fn;
var WidgetContainer = class {
  constructor(resolver) {
    __privateAdd(this, _WidgetContainer_instances);
    __privateAdd(this, _resolvedWidgets);
    __privateAdd(this, _resolver);
    __privateSet(this, _resolvedWidgets, /* @__PURE__ */ new Map());
    __privateSet(this, _resolver, resolver);
  }
  createInstance(widgetIdentifier, target) {
    return __async(this, null, function* () {
      var _a;
      const WidgetClass = (_a = __privateGet(this, _resolvedWidgets).get(widgetIdentifier)) != null ? _a : yield __privateMethod(this, _WidgetContainer_instances, resolve_fn).call(this, widgetIdentifier);
      return new WidgetClass(target);
    });
  }
};
_resolvedWidgets = new WeakMap();
_resolver = new WeakMap();
_WidgetContainer_instances = new WeakSet();
resolve_fn = function(widgetIdentifier) {
  return __async(this, null, function* () {
    try {
      const widget = yield __privateGet(this, _resolver).call(this, widgetIdentifier);
      __privateGet(this, _resolvedWidgets).set(widgetIdentifier, widget);
      return widget;
    } catch (e) {
      throw new WidgetResolveError(widgetIdentifier, e);
    }
  });
};
var WidgetResolveError = class extends BaseError {
  constructor(widgetIdentifier, cause) {
    super(`Could not resolve widget ${widgetIdentifier}`, { cause });
  }
};

// src/lib/WidgetService.ts
var _container, _widgetIdentifierAttribute, _nodeWidgetMap, _WidgetService_instances, getIdentifier_fn, discoverWidgets_fn, cleanupWidgets_fn, checkIfAborted_fn, initNode_fn;
var WidgetService = class {
  constructor({ widgetContainer, widgetAttribute = "widget" }) {
    __privateAdd(this, _WidgetService_instances);
    __privateAdd(this, _container);
    __privateAdd(this, _widgetIdentifierAttribute);
    __privateAdd(this, _nodeWidgetMap);
    __privateSet(this, _container, widgetContainer);
    __privateSet(this, _widgetIdentifierAttribute, widgetAttribute);
    __privateSet(this, _nodeWidgetMap, /* @__PURE__ */ new Map());
  }
  init(target, callback) {
    return __async(this, null, function* () {
      const context = {
        errors: []
      };
      __privateMethod(this, _WidgetService_instances, discoverWidgets_fn).call(this, target);
      yield __privateMethod(this, _WidgetService_instances, initNode_fn).call(this, target, context);
      callback && callback(context);
    });
  }
  destroy(target) {
    var _a;
    Array.from(target.children).forEach((target2) => this.destroy(target2));
    const targetWidget = __privateGet(this, _nodeWidgetMap).get(target);
    if (targetWidget) {
      if (targetWidget.isDone || !targetWidget.widget) {
        (_a = targetWidget.widget) == null ? void 0 : _a.destroy();
        __privateGet(this, _nodeWidgetMap).delete(target);
      } else {
        targetWidget.isAborted = true;
      }
    }
  }
};
_container = new WeakMap();
_widgetIdentifierAttribute = new WeakMap();
_nodeWidgetMap = new WeakMap();
_WidgetService_instances = new WeakSet();
getIdentifier_fn = function(target) {
  return target.getAttribute(__privateGet(this, _widgetIdentifierAttribute));
};
discoverWidgets_fn = function(target) {
  const widgetIdentifier = __privateMethod(this, _WidgetService_instances, getIdentifier_fn).call(this, target);
  if (widgetIdentifier && !__privateGet(this, _nodeWidgetMap).has(target)) {
    __privateGet(this, _nodeWidgetMap).set(target, { identifier: widgetIdentifier });
  }
  Array.from(target.children).forEach((child) => __privateMethod(this, _WidgetService_instances, discoverWidgets_fn).call(this, child));
};
/**
 * Cleans up widget wrapper objects for yet uninitialized subtree
 * @private
 */
cleanupWidgets_fn = function(target) {
  Array.from(target.children).forEach((child) => __privateMethod(this, _WidgetService_instances, cleanupWidgets_fn).call(this, child));
  __privateGet(this, _nodeWidgetMap).delete(target);
};
checkIfAborted_fn = function(target) {
  const nodeWidget = __privateGet(this, _nodeWidgetMap).get(target);
  return !!(nodeWidget == null ? void 0 : nodeWidget.isAborted);
};
initNode_fn = function(target, context) {
  return __async(this, null, function* () {
    const widgetIdentifier = __privateMethod(this, _WidgetService_instances, getIdentifier_fn).call(this, target);
    try {
      const nodeWidget = __privateGet(this, _nodeWidgetMap).get(target);
      if (nodeWidget) {
        if (__privateMethod(this, _WidgetService_instances, checkIfAborted_fn).call(this, target)) {
          __privateMethod(this, _WidgetService_instances, cleanupWidgets_fn).call(this, target);
          throw new WidgetDestroyedError(nodeWidget.identifier);
        }
        const widget = yield __privateGet(this, _container).createInstance(widgetIdentifier, target);
        nodeWidget.widget = widget;
        try {
          yield widget.init();
        } catch (e) {
          nodeWidget.isDone = true;
          throw new WidgetInitializationError(widgetIdentifier, e);
        }
        if (__privateMethod(this, _WidgetService_instances, checkIfAborted_fn).call(this, target)) {
          widget.destroy();
          __privateMethod(this, _WidgetService_instances, cleanupWidgets_fn).call(this, target);
          return;
        }
        __privateMethod(this, _WidgetService_instances, discoverWidgets_fn).call(this, target);
      }
      yield Promise.allSettled(
        Array.from(target.children).map((child) => __async(this, null, function* () {
          return yield __privateMethod(this, _WidgetService_instances, initNode_fn).call(this, child, context);
        }))
      );
      if (nodeWidget) {
        if (__privateMethod(this, _WidgetService_instances, checkIfAborted_fn).call(this, target)) {
          nodeWidget.widget.destroy();
          __privateMethod(this, _WidgetService_instances, cleanupWidgets_fn).call(this, target);
          throw new WidgetDestroyedError(nodeWidget.identifier);
        }
        if (nodeWidget.widget.afterSubtreeInit) {
          yield nodeWidget.widget.afterSubtreeInit();
        }
        nodeWidget.isDone = true;
      }
    } catch (e) {
      if (e instanceof WidgetInitializationError || e instanceof WidgetDestroyedError || e instanceof WidgetResolveError) {
        context.errors.push(e);
      } else {
        throw e;
      }
    }
  });
};
var WidgetInitializationError = class extends BaseError {
  constructor(widgetIdentifier, cause) {
    super(`Could not initialize widget ${widgetIdentifier}`, { cause });
  }
};
var WidgetDestroyedError = class extends BaseError {
  constructor(widgetIdentifier) {
    super(`Widget ${widgetIdentifier} destroyed before it could be initialized`);
  }
};

// src/lib/Widget.ts
var Widget = class {
  constructor(target) {
    this.target = target;
    return new Proxy(this, bindThisHandler);
  }
};
var bindThisHandler = {
  get(target, prop) {
    if (typeof prop === "string" && prop.endsWith("Handler") && prop in target && typeof target[prop] === "function") {
      return target[prop].bind(target);
    }
    return target[prop];
  }
};

// src/lib/index.ts
var lib_default = { WidgetService, WidgetContainer, Widget };
export {
  Widget,
  WidgetContainer,
  WidgetService,
  lib_default as default
};
