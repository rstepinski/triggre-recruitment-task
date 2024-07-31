const root = document.getElementById("app");

/**
 * @typedef NodeInfo
 * @type {object}
 * @property {'widget' | 'node'} type
 * @property {string} state
 * @property {string} widget
 * @property {string} initCount
 * @property {string} destroyCount
 */

/** @type {Map<HTMLElement, NodeInfo>} */
const devInfoMap = new Map();

const devToolsContainer = document.createElement("div");
devToolsContainer.id = "devtools";
const devToolsInfoContainer = document.createElement("div");
devToolsInfoContainer.className = "info";
devToolsContainer.appendChild(devToolsInfoContainer);
document.body.appendChild(devToolsContainer);

/**
 * @param {HTMLElement} target
 */
const computeDevInfo = (target) => {
  /** @type {NodeInfo} */
  const info = {};
  if (target.dataset.widget) {
    info.type = "widget";
    info.state = target.dataset.state;
    info.widget = target.dataset.widget;
    info.initCount = target.dataset.initCount;
    info.destroyCount = target.dataset.destroyCount;
  } else {
    info.type = "node";
  }

  devInfoMap.set(target, info);

  Array.from(target.children).forEach(computeDevInfo);
};

/**
 * Using DOM elements as map keys will keep them in the memory, so we need to garbage collect them manually
 */
const gcDevInfo = () => {
  Array.from(devInfoMap.keys()).forEach(
    /** @param {HTMLElement} target */ (target) => {
      if (!document.body.contains(target)) {
        devInfoMap.delete(target);
      }
    }
  );
};

/**
 * @param {HTMLElement} devTarget
 * @param {HTMLElement} target
 */
const createActionsBlock = (devTarget, target, isWidget) => {
  const actions = document.createElement("div");
  actions.className = "actions";

  const initBtn = document.createElement("button");
  initBtn.innerText = "init()";
  initBtn.addEventListener("click", () =>
    window.service.init(target, console.log)
  );

  const destroyBtn = document.createElement("button");
  destroyBtn.innerText = "destroy()";
  destroyBtn.addEventListener("click", () => window.service.destroy(target));

  actions.append(initBtn, destroyBtn);

  if (isWidget) {
    const willFail = document.createElement("button");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = target.dataset.willFail != null;
    willFail.append(checkbox, " fail");
    willFail.addEventListener("click", () => {
      if (target.dataset.willFail != null) {
        delete target.dataset.willFail;
      } else {
        target.dataset.willFail = "";
      }
    });

    actions.append(willFail);
  }

  devTarget.append(actions);
};

const displayDevInfo = () => {
  const newBlocks = [];
  Array.from(devInfoMap.entries()).forEach(
    /** @param {[HTMLElement, NodeInfo]} entry */
    ([target, info]) => {
      const targetInfo = document.createElement("div");
      targetInfo.className = "info-block";
      if (info.type === "node") {
        targetInfo.innerHTML = `<div>NODE</div>`;
      } else {
        targetInfo.innerHTML = `
          <div><b>WIDGET</b></div>
          <div>path: ${info.widget}</div>
          <div>state: 
            <div class="info-value" data-state="${info.state}">${info.state}</div>
          </div>
          <div>init() calls: ${info.initCount ?? ""}</div>
          <div>destroy() calls: ${info.destroyCount ?? ""}</div>
        `;
      }
      const { x, y } = target.getBoundingClientRect();
      const yOffset = y - document.body.getBoundingClientRect().y;
      targetInfo.setAttribute(
        "style",
        `transform: translate(${x}px, ${yOffset}px)`
      );
      createActionsBlock(targetInfo, target, info.type === 'widget');
      newBlocks.push(targetInfo);
    }
  );

  devToolsInfoContainer.replaceChildren(...newBlocks);
};

const dev = () => {
  computeDevInfo(root);
  gcDevInfo();
  displayDevInfo();
};

const mutationObserver = new MutationObserver(dev);
const resizeObserver = new ResizeObserver(dev);

mutationObserver.observe(root, {
  subtree: true,
  childList: true,
  attributes: true,
});

resizeObserver.observe(root);
