import { WidgetService, WidgetContainer } from "./lib/libx/index.js";

const container = new WidgetContainer(
  async (identifier) => (await import(`/widgets/${identifier}.js`)).default
);

const service = new WidgetService({
  widgetContainer: container,
  widgetAttribute: "data-widget",
});

window.service = service;
