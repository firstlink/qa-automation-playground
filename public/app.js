const SEED_DATA = {
  users: [{ username: "student", password: "Password123!" }],
  products: [
    { id: 1, name: "Laptop", price: 999, stock: 6 },
    { id: 2, name: "Phone", price: 599, stock: 11 },
    { id: 3, name: "Headphones", price: 149, stock: 18 },
    { id: 4, name: "Monitor", price: 329, stock: 8 }
  ],
  orders: [],
  notifications: ["Welcome!", "Order placed successfully"]
};

const STORAGE_KEY = "qa-automation-playground-state-v1";

const AUDIT_ROWS = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  owner: ["Alex", "Taylor", "Jordan", "Morgan"][index % 4],
  status: ["Queued", "Running", "Passed", "Failed"][index % 4],
  duration: 15 + index * 3
}));

const COVERAGE_MAP = [
  { feature: "Checkboxes", route: "/selection-controls", status: "Implemented" },
  { feature: "Dropdown", route: "/selection-controls", status: "Implemented" },
  { feature: "Drag Drop", route: "/interactions/drag-drop", status: "Implemented" },
  { feature: "Alerts", route: "/dialogs", status: "Implemented" },
  { feature: "Frames", route: "/frames/editor", status: "Implemented" },
  { feature: "Dynamic Loading", route: "/dynamic/loading", status: "Implemented" },
  { feature: "File Upload", route: "/files/upload", status: "Implemented" },
  { feature: "File Download", route: "/files/download", status: "Implemented" },
  { feature: "Infinite Scroll", route: "/scrolling/infinite", status: "Implemented" },
  { feature: "Broken Images", route: "/status", status: "Implemented" },
  { feature: "Key Presses", route: "/keyboard", status: "Implemented" },
  { feature: "Redirect", route: "/windows", status: "Implemented" },
  { feature: "Shadow DOM", route: "/advanced-locators", status: "Implemented" },
  { feature: "Tables", route: "/tables/sortable", status: "Implemented" }
];

const NAV_GROUP_ORDER = [
  "Overview",
  "Core",
  "Forms",
  "Tables",
  "Dynamic",
  "Frames",
  "Windows",
  "Interactions",
  "Files",
  "Locators",
  "Auth",
  "Scrolling",
  "API",
  "Flaky",
  "Shop",
  "Status"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEditableRows() {
  return SEED_DATA.products.map((product) => ({
    id: product.id,
    name: product.name,
    owner: product.id % 2 === 0 ? "Automation Pod" : "QA Guild",
    status: product.id % 2 === 0 ? "Ready" : "Draft",
    quantity: product.stock
  }));
}

function createDefaultState() {
  return {
    admin: {
      stableMode: true,
      flakyMode: false,
      slowNetwork: false,
      dynamicIds: false
    },
    auth: {
      basicGranted: false,
      sessionLoggedIn: false,
      shopLoggedIn: false
    },
    users: clone(SEED_DATA.users),
    products: clone(SEED_DATA.products),
    orders: clone(SEED_DATA.orders),
    notifications: clone(SEED_DATA.notifications),
    cart: [],
    logs: [],
    navHistory: [],
    output: {
      route: "/",
      title: "Ready",
      payload: {
        message: "Interact with a scenario to populate the result panel."
      }
    },
    counters: {
      interactions: 0,
      buttonListCount: 2,
      clickCount: 0,
      doubleClickCount: 0,
      longPressCount: 0,
      rerenderVersion: 1
    },
    tables: {
      sortKey: "id",
      sortDirection: "asc",
      page: 1,
      editableRows: createEditableRows()
    },
    dynamic: {
      optionsLoaded: false,
      spinnerLoaded: false,
      delayedVisible: false,
      controlsEnabled: false,
      disappearingVisible: true,
      disappearingArmed: false
    },
    ui: {
      activeModal: null,
      nestedModal: false,
      entryModalSeen: false,
      exitModalSeen: false,
      toasts: [],
      customMenu: null,
      lastApiResponse: null,
      apiError: null,
      delayedButtonReady: false,
      delayedButtonDelay: null,
      raceResult: null,
      scrollingCount: 12,
      geo: null
    },
    shop: {
      lastOrderId: null
    },
    seed: 20260416
  };
}

function normalizeState(candidate) {
  const defaults = createDefaultState();
  const state = candidate && typeof candidate === "object" ? candidate : {};

  return {
    ...defaults,
    ...state,
    admin: { ...defaults.admin, ...(state.admin || {}) },
    auth: { ...defaults.auth, ...(state.auth || {}) },
    counters: { ...defaults.counters, ...(state.counters || {}) },
    tables: {
      ...defaults.tables,
      ...(state.tables || {}),
      editableRows: Array.isArray(state.tables?.editableRows)
        ? state.tables.editableRows
        : defaults.tables.editableRows
    },
    dynamic: { ...defaults.dynamic, ...(state.dynamic || {}) },
    ui: {
      ...defaults.ui,
      ...(state.ui || {}),
      toasts: Array.isArray(state.ui?.toasts) ? state.ui.toasts : defaults.ui.toasts
    },
    shop: { ...defaults.shop, ...(state.shop || {}) },
    users: Array.isArray(state.users) ? state.users : defaults.users,
    products: Array.isArray(state.products) ? state.products : defaults.products,
    orders: Array.isArray(state.orders) ? state.orders : defaults.orders,
    notifications: Array.isArray(state.notifications) ? state.notifications : defaults.notifications,
    cart: Array.isArray(state.cart) ? state.cart : defaults.cart,
    logs: Array.isArray(state.logs) ? state.logs : defaults.logs,
    navHistory: Array.isArray(state.navHistory) ? state.navHistory : defaults.navHistory,
    output: state.output || defaults.output
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultState();
  }
}

let state = loadState();
const cleanupFns = [];
const runtime = {
  longPressTimer: null,
  lazyObserver: null,
  currentRouteKey: null
};

const refs = {
  sidebar: document.getElementById("sidebar-nav"),
  pageGroup: document.getElementById("page-group"),
  pageTitle: document.getElementById("page-title"),
  pageDescription: document.getElementById("page-description"),
  heroBadges: document.getElementById("hero-badges"),
  componentArea: document.getElementById("component-area"),
  outputContent: document.getElementById("output-content"),
  outputRouteChip: document.getElementById("output-route-chip"),
  debugContent: document.getElementById("debug-content"),
  toastRegion: document.getElementById("toast-region"),
  modalRoot: document.getElementById("modal-root")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function prettyJson(value) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function normalizePath(pathname) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

function getCurrentPath() {
  return normalizePath(window.location.pathname);
}

function hashText(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomUnit(label) {
  return hashText(`${state.seed}:${state.counters.interactions}:${label}`) / 4294967295;
}

function scenarioDelayMs(label, base = 250, spread = 700) {
  let delay = base;
  if (state.admin.flakyMode) {
    delay = Math.round(base + randomUnit(label) * spread);
  }
  if (state.admin.slowNetwork) {
    delay += 900;
  }
  return delay;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dynamicId(base) {
  if (!state.admin.dynamicIds) {
    return base;
  }
  return `${base}-${hashText(`${base}:${state.counters.interactions}`).toString(36).slice(0, 5)}`;
}

function routeButton(path, label, style = "secondary") {
  return `<button type="button" class="${style === "primary" ? "primary-button" : "ghost-button"}" data-nav="${path}">${escapeHtml(label)}</button>`;
}

function card(title, description, body, extraClass = "") {
  return `
    <article class="card ${extraClass}">
      <h3>${escapeHtml(title)}</h3>
      ${description ? `<p class="card-description">${escapeHtml(description)}</p>` : ""}
      ${body}
    </article>
  `;
}

function metrics(items) {
  return `
    <div class="metric-grid">
      ${items
        .map(
          (item) => `
            <div class="metric">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function linkList(paths) {
  return `<div class="button-row">${paths.map((item) => routeButton(item.path, item.label)).join("")}</div>`;
}

function createSvgDataUri(label, tone) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="${tone}" />
      <circle cx="520" cy="120" r="54" fill="rgba(255,255,255,0.26)" />
      <rect x="52" y="82" width="220" height="18" rx="9" fill="rgba(255,255,255,0.62)" />
      <rect x="52" y="126" width="330" height="12" rx="6" fill="rgba(255,255,255,0.44)" />
      <rect x="52" y="338" width="160" height="14" rx="7" fill="rgba(255,255,255,0.56)" />
      <text x="52" y="264" font-family="Avenir Next, Segoe UI, sans-serif" font-size="38" fill="white">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function findProduct(productId) {
  return state.products.find((product) => product.id === Number(productId));
}

function cartItemCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function setOutput(title, payload) {
  state.output = {
    route: getCurrentPath(),
    title,
    payload
  };
  saveState();
  renderOutput();
  renderDebug();
}

function logEvent(title, details = {}) {
  state.counters.interactions += 1;
  state.logs.unshift({
    at: new Date().toLocaleTimeString(),
    route: getCurrentPath(),
    title,
    details
  });
  state.logs = state.logs.slice(0, 24);
  saveState();
  renderDebug();
}

function notify(title, message, kind = "info") {
  const toast = {
    id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title,
    message,
    kind
  };
  state.ui.toasts = [...state.ui.toasts, toast];
  saveState();
  renderToasts();
  window.setTimeout(() => {
    state.ui.toasts = state.ui.toasts.filter((item) => item.id !== toast.id);
    saveState();
    renderToasts();
  }, 3200);
}

function clearCleanup() {
  while (cleanupFns.length) {
    const fn = cleanupFns.pop();
    try {
      fn();
    } catch {
      // Ignore teardown issues during rerender.
    }
  }
  if (runtime.lazyObserver) {
    runtime.lazyObserver.disconnect();
    runtime.lazyObserver = null;
  }
}

function listen(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  cleanupFns.push(() => target.removeEventListener(type, handler, options));
}

function rememberNavigation(path) {
  const last = state.navHistory[0];
  if (!last || last.path !== path) {
    state.navHistory.unshift({ path, at: new Date().toLocaleTimeString() });
    state.navHistory = state.navHistory.slice(0, 10);
    saveState();
  }
}

function sectionIndexRoute(route) {
  const children = ROUTES.filter((item) => item.parent === route.path);
  return `
    ${card(
      `${route.label} Scenarios`,
      route.description,
      `
        <p>Choose a scenario route below.</p>
        ${linkList(children.map((item) => ({ path: item.path, label: item.label })))}
      `
    )}
  `;
}

function renderHome() {
  return `
    ${card(
      "Mission Control",
      "Use this sandbox to demo selectors, async behavior, resilient automation, and flaky workflows.",
      `
        ${metrics([
          { label: "Routes", value: String(ROUTES.filter((route) => route.nav !== false).length), note: "Navigation-ready pages" },
          { label: "Products", value: String(state.products.length), note: "Seeded shop inventory" },
          { label: "Orders", value: String(state.orders.length), note: "Captured checkout confirmations" },
          { label: "Cart Items", value: String(cartItemCount()), note: "Persisted in local storage" }
        ])}
      `
    )}
    <div class="component-grid">
      ${card(
        "Quick Start",
        "Jump into the main scenarios learners usually start with.",
        linkList([
          { path: "/basic-elements", label: "Basic Elements" },
          { path: "/forms/login", label: "Login" },
          { path: "/tables/sortable", label: "Sortable Table" },
          { path: "/dynamic/loading", label: "Dynamic Loading" },
          { path: "/shop/products", label: "Shop Flow" }
        ])
      )}
      ${card(
        "Demo Credentials",
        "These are used across the auth and shop scenarios.",
        `
          <div class="notice">
            <p><strong>username:</strong> student</p>
            <p><strong>password:</strong> Password123!</p>
            <p class="status-strip">
              <span class="status-chip">${state.auth.sessionLoggedIn ? "Session active" : "Session inactive"}</span>
              <span class="status-chip">${state.auth.shopLoggedIn ? "Shop logged in" : "Shop logged out"}</span>
            </p>
          </div>
        `
      )}
      ${card(
        "Observability",
        "Every scenario writes to the result panel and recent event log to make demos easy to narrate.",
        `
          <ul class="plain-list">
            <li>Use the global reset button to restore deterministic defaults.</li>
            <li>Flip flaky mode in Admin to enable controlled randomness.</li>
            <li>Turn on dynamic IDs to test resilient locator strategies.</li>
          </ul>
        `
      )}
      ${card(
        "Route Families",
        "Each family mirrors a QA topic from the PRS.",
        linkList([
          { path: "/forms", label: "Forms" },
          { path: "/tables", label: "Tables" },
          { path: "/dynamic", label: "Dynamic" },
          { path: "/interactions", label: "Interactions" },
          { path: "/flaky", label: "Flaky Lab" }
        ])
      )}
    </div>
  `;
}

function renderAdmin() {
  return `
    ${card(
      "Environment Controls",
      "Reset global state and tune the playground for stable or flaky automation runs.",
      `
        <form class="form-grid" data-form="admin-form">
          <label class="field">
            <span>Stable mode</span>
            <input class="admin-toggle" type="checkbox" name="stableMode" ${state.admin.stableMode ? "checked" : ""} data-testid="admin-stable-mode" />
          </label>
          <label class="field">
            <span>Flaky mode</span>
            <input class="admin-toggle" type="checkbox" name="flakyMode" ${state.admin.flakyMode ? "checked" : ""} data-testid="admin-flaky-mode" />
          </label>
          <label class="field">
            <span>Slow network</span>
            <input class="admin-toggle" type="checkbox" name="slowNetwork" ${state.admin.slowNetwork ? "checked" : ""} data-testid="admin-slow-network" />
          </label>
          <label class="field">
            <span>Dynamic IDs</span>
            <input class="admin-toggle" type="checkbox" name="dynamicIds" ${state.admin.dynamicIds ? "checked" : ""} data-testid="admin-dynamic-ids" />
          </label>
        </form>
        <div class="button-row">
          <button class="primary" type="button" data-action="reset-app" data-testid="admin-reset-app">Reset App State</button>
          <button class="secondary" type="button" data-action="show-toast" data-toast-title="Admin" data-toast-message="Configuration saved">Show toast</button>
        </div>
      `
    )}
    <div class="component-grid">
      ${card(
        "Seed Data",
        "Credentials, products, and notifications are restored by reset.",
        `<pre class="code-block">${escapeHtml(prettyJson(SEED_DATA))}</pre>`
      )}
      ${card(
        "Mode Notes",
        "Flaky mode uses a seeded hash so each reset returns to a repeatable randomness pattern.",
        `
          <ul class="plain-list">
            <li>Stable mode favors deterministic timing and content.</li>
            <li>Slow network adds a visible delay layer to async actions.</li>
            <li>Dynamic IDs rotate element IDs on rerender to challenge brittle selectors.</li>
          </ul>
        `
      )}
    </div>
  `;
}

function renderBasicElements() {
  const textId = dynamicId("basic-text");
  const passwordId = dynamicId("basic-password");
  const emailId = dynamicId("basic-email");
  const numberId = dynamicId("basic-number");
  const urlId = dynamicId("basic-url");
  const notesId = dynamicId("basic-notes");

  return `
    ${card(
      "Inputs and Standard Controls",
      "Submit writes values to the result panel. Reset restores the seeded defaults.",
      `
        <form data-form="basic-elements-form" data-testid="basic-elements-form">
          <div class="form-grid">
            <label class="field" for="${textId}">
              <span>Text input</span>
              <input id="${textId}" name="textValue" type="text" value="automation learner" />
            </label>
            <label class="field" for="${passwordId}">
              <span>Password input</span>
              <input id="${passwordId}" name="passwordValue" type="password" value="Password123!" />
            </label>
            <label class="field" for="${emailId}">
              <span>Email input</span>
              <input id="${emailId}" name="emailValue" type="email" value="student@example.com" />
            </label>
            <label class="field" for="${numberId}">
              <span>Number input</span>
              <input id="${numberId}" name="numberValue" type="number" value="42" />
            </label>
            <label class="field" for="${urlId}">
              <span>URL input</span>
              <input id="${urlId}" name="urlValue" type="url" value="https://example.com/docs" />
            </label>
            <label class="field" for="${notesId}">
              <span>Textarea</span>
              <textarea id="${notesId}" name="notesValue">Track field values, labels, and accessibility hooks.</textarea>
            </label>
            <label class="field">
              <span>Disabled field</span>
              <input type="text" value="locked value" disabled />
            </label>
            <label class="field">
              <span>Readonly field</span>
              <input type="text" value="read only reference" readonly />
            </label>
          </div>
          <div class="button-row">
            <button class="primary" type="submit" data-testid="basic-submit">Submit</button>
            <button class="secondary" type="reset" data-testid="basic-reset">Reset</button>
          </div>
        </form>
      `
    )}
    <div class="component-grid">
      ${card(
        "Links and Images",
        "Useful for link assertions and media handling.",
        `
          <p><a href="https://example.com" target="_blank" rel="noreferrer" data-testid="basic-external-link">External example link</a></p>
          <img src="${createSvgDataUri("Automation", "#0f766e")}" alt="Illustrated automation banner" style="width:100%;border-radius:16px;" />
        `
      )}
      ${card(
        "Selector Notes",
        "The page mixes semantic labels with a few intentionally plain class names.",
        `
          <div class="chips-row">
            <span class="mini-chip">data-testid available</span>
            <span class="mini-chip warning">generic .field classes present</span>
          </div>
        `
      )}
    </div>
  `;
}

function renderSelectionControls() {
  const dynamicOptions = state.dynamic.optionsLoaded
    ? `
      <option value="delayed-smoke">Delayed Smoke Test</option>
      <option value="delayed-api">Delayed API Contract</option>
      <option value="delayed-shop">Delayed Shop Journey</option>
    `
    : `<option value="">Load options first</option>`;

  return `
    ${card(
      "Checkboxes, Radios, and Dropdowns",
      "Includes a delayed dropdown to simulate async option loading.",
      `
        <form data-form="selection-controls-form" data-testid="selection-controls-form">
          <div class="two-col-grid">
            <fieldset>
              <legend>Checkboxes</legend>
              <label><input type="checkbox" name="features" value="alerts" checked /> Alerts</label>
              <label><input type="checkbox" name="features" value="frames" /> Frames</label>
              <label><input type="checkbox" name="features" value="downloads" checked /> Downloads</label>
            </fieldset>
            <fieldset>
              <legend>Radio group</legend>
              <label><input type="radio" name="priority" value="low" checked /> Low</label>
              <label><input type="radio" name="priority" value="medium" /> Medium</label>
              <label><input type="radio" name="priority" value="high" /> High</label>
            </fieldset>
            <label class="field">
              <span>Single select</span>
              <select name="browser">
                <option value="chromium">Chromium</option>
                <option value="firefox">Firefox</option>
                <option value="webkit">WebKit</option>
              </select>
            </label>
            <label class="field">
              <span>Multi select</span>
              <select name="suites" multiple size="4">
                <option value="smoke" selected>Smoke</option>
                <option value="regression" selected>Regression</option>
                <option value="visual">Visual</option>
                <option value="accessibility">Accessibility</option>
              </select>
            </label>
            <label class="field">
              <span>Dynamic dropdown</span>
              <select name="dynamicSuite" ${state.dynamic.optionsLoaded ? "" : "disabled"} data-testid="dynamic-dropdown">
                ${dynamicOptions}
              </select>
            </label>
          </div>
          <div class="button-row">
            <button class="secondary" type="button" data-action="load-dynamic-options" data-testid="load-dynamic-options">Load Dynamic Options</button>
            <button class="primary" type="submit">Submit Selection State</button>
          </div>
        </form>
      `
    )}
  `;
}

function renderButtons() {
  const clones = Array.from({ length: state.counters.buttonListCount }, (_, index) => index + 1);

  return `
    <div class="component-grid">
      ${card(
        "Primary Click Targets",
        "Exercise click, double-click, right-click, hover, and long-press behaviors.",
        `
          <div class="button-row">
            <button class="primary" type="button" data-action="count-click" data-testid="click-button">Click button (${state.counters.clickCount})</button>
            <button class="secondary" type="button" id="double-click-target" data-testid="double-click-button">Double click (${state.counters.doubleClickCount})</button>
            <button class="secondary" type="button" data-long-press="true" data-testid="long-press-button">Long press (${state.counters.longPressCount})</button>
          </div>
          <div class="hover-zone" tabindex="0">
            <p>Hover or focus this card to reveal the hidden button.</p>
            <button class="secondary hover-reveal" type="button" data-action="hover-reveal">Hidden hover action</button>
          </div>
          <div class="notice" id="context-zone" tabindex="0" data-testid="context-zone">
            Right-click in this area to open a custom menu.
          </div>
          <div id="context-menu-anchor"></div>
        `
      )}
      ${card(
        "Dynamic Elements",
        "Add and remove buttons to practice list assertions and stale element handling.",
        `
          <div class="button-row">
            <button class="secondary" type="button" data-action="add-button-clone">Add element</button>
            <button class="secondary" type="button" data-action="remove-button-clone">Remove element</button>
          </div>
          <div class="button-row" aria-label="Dynamic buttons">
            ${clones
              .map(
                (item) => `<button class="secondary btn" type="button" data-action="clone-press" data-clone="${item}">Dynamic button ${item}</button>`
              )
              .join("")}
          </div>
        `
      )}
    </div>
  `;
}

function renderDialogs() {
  return `
    <div class="component-grid">
      ${card(
        "Native Dialogs",
        "Alert, confirm, and prompt interactions are useful for automation handling demos.",
        `
          <div class="button-row">
            <button class="secondary" type="button" data-action="show-alert">Alert</button>
            <button class="secondary" type="button" data-action="show-confirm">Confirm</button>
            <button class="secondary" type="button" data-action="show-prompt">Prompt</button>
          </div>
        `
      )}
      ${card(
        "Modal Stack",
        "The playground includes standard, nested, entry, and exit-intent modals.",
        `
          <div class="button-row">
            <button class="primary" type="button" data-action="open-modal" data-modal="standard">Open modal</button>
            <button class="secondary" type="button" data-action="open-modal" data-modal="nested">Open nested modal</button>
            <button class="secondary" type="button" data-action="show-toast" data-toast-title="Toast Demo" data-toast-message="A notification just appeared">Toast notification</button>
            <button class="secondary" type="button" data-action="open-modal" data-modal="entry">Entry modal</button>
            <button class="secondary" type="button" data-action="open-modal" data-modal="exit">Exit intent modal</button>
          </div>
        `
      )}
    </div>
  `;
}

function renderLoginForm() {
  return `
    ${card(
      "Login Scenario",
      "Try valid and invalid credentials to exercise success and failure states.",
      `
        <form data-form="login-form" class="form-grid" data-testid="login-form">
          <label class="field">
            <span>Username</span>
            <input name="username" type="text" autocomplete="username" value="student" />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" value="Password123!" />
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Log in</button>
            <button class="secondary" type="button" data-action="prefill-invalid-login">Use invalid credentials</button>
          </div>
        </form>
      `
    )}
  `;
}

function renderRegisterForm() {
  return `
    ${card(
      "Register Scenario",
      "Validation enforces username uniqueness, password strength, and password confirmation.",
      `
        <form data-form="register-form" class="form-grid" data-testid="register-form">
          <label class="field">
            <span>Username</span>
            <input name="username" type="text" required />
          </label>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" required />
          </label>
          <label class="field">
            <span>Confirm password</span>
            <input name="confirmPassword" type="password" required />
          </label>
          <button class="primary" type="submit">Create account</button>
        </form>
      `
    )}
  `;
}

function renderForgotPasswordForm() {
  return `
    ${card(
      "Forgot Password",
      "Submit an email address to simulate a password reset request.",
      `
        <form data-form="forgot-password-form" class="form-grid">
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" value="student@example.com" />
          </label>
          <button class="primary" type="submit">Send reset link</button>
        </form>
      `
    )}
  `;
}

function renderStaticTable() {
  return `
    ${card(
      "Static Inventory Table",
      "Simple fixed rows for baseline table assertions.",
      `
        <table data-testid="static-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            ${state.products
              .map(
                (product) => `
                  <tr>
                    <td>${product.id}</td>
                    <td>${escapeHtml(product.name)}</td>
                    <td>$${product.price}</td>
                    <td>${product.stock}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `
    )}
  `;
}

function getSortedRows() {
  const rows = clone(AUDIT_ROWS);
  const { sortKey, sortDirection } = state.tables;
  rows.sort((a, b) => {
    const left = a[sortKey];
    const right = b[sortKey];
    if (left < right) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (left > right) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  return rows;
}

function renderSortableTable() {
  const rows = getSortedRows();
  const sortChip = `${state.tables.sortKey} (${state.tables.sortDirection})`;
  const header = (label, key) => `
    <th>
      <button type="button" data-action="sort-table" data-key="${key}">
        ${label}
      </button>
    </th>
  `;

  return `
    ${card(
      "Sortable Table",
      `Current sort: ${sortChip}. Click a column heading to change order.`,
      `
        <table data-testid="sortable-table">
          <thead>
            <tr>
              ${header("ID", "id")}
              ${header("Owner", "owner")}
              ${header("Status", "status")}
              ${header("Duration", "duration")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.id}</td>
                    <td>${escapeHtml(row.owner)}</td>
                    <td>${escapeHtml(row.status)}</td>
                    <td>${row.duration}s</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `
    )}
  `;
}

function renderPaginatedTable() {
  const pageSize = 5;
  const totalPages = Math.ceil(AUDIT_ROWS.length / pageSize);
  const page = Math.min(state.tables.page, totalPages);
  const rows = AUDIT_ROWS.slice((page - 1) * pageSize, page * pageSize);

  return `
    ${card(
      "Paginated Table",
      `Page ${page} of ${totalPages}.`,
      `
        <table data-testid="paginated-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.id}</td>
                    <td>${escapeHtml(row.owner)}</td>
                    <td>${escapeHtml(row.status)}</td>
                    <td>${row.duration}s</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
        <div class="pagination-row">
          <button class="secondary" type="button" data-action="page-prev" ${page === 1 ? "disabled" : ""}>Previous</button>
          <button class="secondary" type="button" data-action="page-next" ${page === totalPages ? "disabled" : ""}>Next</button>
        </div>
      `
    )}
  `;
}

function renderEditableTable() {
  return `
    ${card(
      "Editable Table",
      "Update quantities and save the rows back into the result panel.",
      `
        <form data-form="editable-table-form">
          <table data-testid="editable-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${state.tables.editableRows
                .map(
                  (row) => `
                    <tr>
                      <td>${escapeHtml(row.name)}</td>
                      <td>${escapeHtml(row.owner)}</td>
                      <td>${escapeHtml(row.status)}</td>
                      <td>
                        <label class="field">
                          <span class="hidden">Quantity for ${escapeHtml(row.name)}</span>
                          <input type="number" min="0" name="quantity-${row.id}" value="${row.quantity}" />
                        </label>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <div class="button-row">
            <button class="primary" type="submit">Save table</button>
          </div>
        </form>
      `
    )}
  `;
}

function renderLoadingScenario() {
  return `
    ${card(
      "Loading Spinner",
      "Trigger a visible spinner, then reveal the loaded content after a timed delay.",
      `
        <div id="spinner-result" class="notice">
          ${
            state.dynamic.spinnerLoaded
              ? "<strong>Loaded:</strong> Spinner finished and content is now available."
              : "Content has not loaded yet."
          }
        </div>
        <div class="button-row">
          <button class="primary" type="button" data-action="trigger-spinner">Start loading</button>
        </div>
      `
    )}
  `;
}

function renderDelayedContent() {
  return `
    ${card(
      "Delayed Content",
      "Reveal hidden content after a deterministic or flaky delay.",
      `
        <div class="notice" id="delayed-content-panel">
          ${state.dynamic.delayedVisible ? "Hidden content is now visible and ready for assertions." : "Content is still hidden."}
        </div>
        <button class="primary" type="button" data-action="trigger-delayed-content">Reveal delayed content</button>
      `
    )}
  `;
}

function renderDynamicControls() {
  return `
    ${card(
      "Enable and Disable Controls",
      "Toggle the same controls between active and disabled states.",
      `
        <div class="form-grid">
          <label class="field">
            <span>Dynamic input</span>
            <input type="text" value="toggle me" ${state.dynamic.controlsEnabled ? "" : "disabled"} />
          </label>
          <label class="field">
            <span>Dynamic select</span>
            <select ${state.dynamic.controlsEnabled ? "" : "disabled"}>
              <option>Ready</option>
              <option>Blocked</option>
            </select>
          </label>
        </div>
        <button class="primary" type="button" data-action="toggle-controls">
          ${state.dynamic.controlsEnabled ? "Disable controls" : "Enable controls"}
        </button>
      `
    )}
  `;
}

function renderDisappearingElements() {
  return `
    ${card(
      "Disappearing Elements",
      "Arm a disappearing element to test waits and retries.",
      `
        <div class="notice">
          ${
            state.dynamic.disappearingVisible
              ? "<span data-testid=\"disappearing-chip\">This chip may disappear after you arm the scenario.</span>"
              : "The element has disappeared."
          }
        </div>
        <button class="primary" type="button" data-action="toggle-disappearing">
          ${state.dynamic.disappearingVisible ? "Arm disappearance" : "Restore element"}
        </button>
      `
    )}
  `;
}

function renderFramesEditor() {
  return `
    ${card(
      "iFrame Editor",
      "The iframe uses same-origin srcdoc content with an editable region.",
      `
        <div class="iframe-shell">
          <iframe id="editor-frame" title="Editable iframe"></iframe>
        </div>
      `
    )}
  `;
}

function renderFramesNested() {
  return `
    ${card(
      "Nested Frames",
      "An outer iframe contains a second inner iframe to exercise frame traversal.",
      `
        <div class="iframe-shell">
          <iframe id="nested-frame" title="Nested frame demo"></iframe>
        </div>
      `
    )}
  `;
}

function renderWindows() {
  const query = new URLSearchParams(window.location.search);

  return `
    ${card(
      "Windows and Navigation",
      "Open a new tab, follow a redirect, and inspect the recorded navigation history.",
      `
        ${query.get("redirected") === "1" ? '<div class="notice">Redirect completed and returned to the windows route.</div>' : ""}
        <div class="button-row">
          <button class="primary" type="button" data-action="open-new-tab">Open new tab</button>
          <button class="secondary" type="button" data-action="trigger-redirect">Trigger redirect</button>
        </div>
        <ul class="plain-list">
          ${state.navHistory.map((item) => `<li>${escapeHtml(item.path)} at ${escapeHtml(item.at)}</li>`).join("")}
        </ul>
      `
    )}
  `;
}

function renderDragDrop() {
  return `
    ${card(
      "Drag and Drop",
      "Use the draggable token and drop target to simulate a standard interaction flow.",
      `
        <div class="button-row">
          <div class="drag-item" draggable="true" id="drag-token" data-testid="drag-token">Drag me</div>
        </div>
        <div class="drag-target" id="drop-target" data-testid="drop-target">
          Drop target
        </div>
      `
    )}
  `;
}

function renderHoverActions() {
  return `
    ${card(
      "Hover Actions",
      "Reveal follow-up actions when the hover zone becomes active.",
      `
        <div class="hover-zone" tabindex="0">
          <p>Move the pointer here to reveal the actions.</p>
          <div class="button-row hover-reveal">
            <button class="secondary" type="button" data-action="hover-reveal">Open details</button>
            <button class="secondary btn" type="button" data-action="hover-reveal">Poor selector button</button>
          </div>
        </div>
      `
    )}
  `;
}

function renderSlider() {
  return `
    ${card(
      "Slider",
      "Adjust the range input and verify the live value updates.",
      `
        <label class="field">
          <span>Confidence threshold</span>
          <input id="slider-control" type="range" min="0" max="100" value="60" />
        </label>
        <p>Current value: <strong id="slider-value">60</strong>%</p>
      `
    )}
  `;
}

function renderMenu() {
  return `
    ${card(
      "Multi-level Menu",
      "Designed for click and keyboard-navigation demos.",
      `
        <div class="menu-shell" role="menu">
          <ul>
            <li>
              <button type="button" data-action="menu-pick" data-item="Overview">Overview</button>
            </li>
            <li>
              <button type="button" data-action="menu-pick" data-item="Scenarios">Scenarios</button>
            </li>
            <li>
              <button type="button" data-action="menu-pick" data-item="Reports">Reports</button>
            </li>
          </ul>
        </div>
      `
    )}
  `;
}

function renderUpload() {
  return `
    ${card(
      "Upload",
      "Use the file picker to inspect name and size in the output panel.",
      `
        <label class="field">
          <span>Choose files</span>
          <input id="upload-input" type="file" multiple data-testid="upload-input" />
        </label>
      `
    )}
  `;
}

function renderDownload() {
  return `
    ${card(
      "Download",
      "Download multiple file types from the local Node server.",
      `
        <div class="button-row">
          <a class="button-link secondary" href="/download/sample-report.txt" download data-testid="download-text">TXT file</a>
          <a class="button-link secondary" href="/download/products.csv" download data-testid="download-csv">CSV file</a>
          <a class="button-link secondary" href="/download/summary.json" download data-testid="download-json">JSON file</a>
        </div>
      `
    )}
  `;
}

function renderAdvancedLocators() {
  const firstId = dynamicId("duplicate-username-a");
  const secondId = dynamicId("duplicate-username-b");
  const targetId = dynamicId("target-node");

  return `
    <div class="component-grid">
      ${card(
        "Shadow DOM",
        "A shadow host is attached after render so locator strategies can pierce shadow roots.",
        `<div id="shadow-host" class="shadow-host" data-testid="shadow-host"></div>`
      )}
      ${card(
        "Deep DOM and Dynamic IDs",
        "The nested target gets a rotating ID whenever dynamic IDs are enabled.",
        `
          <div class="notice">
            <div class="level-1">
              <div class="level-2">
                <div class="level-3">
                  <span id="${targetId}" data-testid="deep-target">Deep target node</span>
                </div>
              </div>
            </div>
          </div>
        `
      )}
      ${card(
        "Duplicate Labels",
        "Both inputs intentionally share the same label text.",
        `
          <label class="field" for="${firstId}">
            <span>Username</span>
            <input id="${firstId}" type="text" />
          </label>
          <label class="field" for="${secondId}">
            <span>Username</span>
            <input id="${secondId}" type="text" />
          </label>
        `
      )}
    </div>
  `;
}

function renderBasicAuth() {
  return `
    ${card(
      "Basic Auth Simulation",
      "This form simulates a basic-auth style credential gate.",
      `
        <form data-form="basic-auth-form" class="form-grid">
          <label class="field">
            <span>Username</span>
            <input name="username" type="text" value="student" />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" value="Password123!" />
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Authorize</button>
            <button class="secondary" type="button" data-action="logout-basic">Clear basic auth</button>
          </div>
        </form>
      `
    )}
  `;
}

function renderSessionAuth() {
  return `
    ${card(
      "Session Login",
      "Logs a persistent session into local storage so protected pages can be visited.",
      `
        <form data-form="session-auth-form" class="form-grid">
          <label class="field">
            <span>Username</span>
            <input name="username" type="text" value="student" />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" value="Password123!" />
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Start session</button>
            <button class="secondary" type="button" data-action="logout-session">Log out</button>
            <button class="secondary" type="button" data-nav="/auth/protected">Protected page</button>
          </div>
        </form>
      `
    )}
  `;
}

function renderProtectedPage() {
  return `
    ${card(
      "Protected Page",
      "Access depends on the session login scenario.",
      state.auth.sessionLoggedIn
        ? `
          <div class="notice">
            Protected content unlocked. Session-based checks succeeded.
          </div>
        `
        : `
          <div class="notice">
            Access denied. Log in through the session route first.
          </div>
          ${routeButton("/auth/session", "Go to session login")}
        `
    )}
  `;
}

function renderInfiniteScroll() {
  const items = Array.from({ length: state.ui.scrollingCount }, (_, index) => index + 1);

  return `
    ${card(
      "Infinite Scroll",
      "Scroll near the end or use the button to append more cards.",
      `
        <div class="scroll-box" id="infinite-scroll-box" data-testid="infinite-scroll-box">
          ${items
            .map(
              (item) => `
                <div class="status-card">
                  <strong>Feed item ${item}</strong>
                  <p>Automation content block ${item} for lazy-loading and scroll assertions.</p>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="button-row">
          <button class="secondary" type="button" data-action="load-more-infinite">Load more</button>
        </div>
      `
    )}
  `;
}

function renderLazyImages() {
  const imageCards = [
    { title: "Mock API response", tone: "#0f766e" },
    { title: "Regression board", tone: "#b45309" },
    { title: "Checkout flow", tone: "#0b4f6c" }
  ];

  return `
    ${card(
      "Lazy Images",
      "Images populate their src only when the observer sees them.",
      `
        <div class="lazy-grid">
          ${imageCards
            .map(
              (item, index) => `
                <figure>
                  <img
                    alt="${escapeHtml(item.title)}"
                    data-src="${createSvgDataUri(item.title, item.tone)}"
                    src="${createSvgDataUri("Loading...", "#d6d3d1")}"
                    data-lazy-image="${index}"
                  />
                  <figcaption>${escapeHtml(item.title)}</figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
      `
    )}
  `;
}

function renderFloatingMenu() {
  return `
    ${card(
      "Floating Menu",
      "The sticky section menu stays visible while the content scrolls beneath it.",
      `
        <div class="scroll-box">
          <div class="sticky-menu">
            <button class="secondary" type="button" data-action="scroll-to-anchor" data-anchor="menu-a">Intro</button>
            <button class="secondary" type="button" data-action="scroll-to-anchor" data-anchor="menu-b">Selectors</button>
            <button class="secondary" type="button" data-action="scroll-to-anchor" data-anchor="menu-c">Recovery</button>
          </div>
          <section id="menu-a" class="status-card"><strong>Intro</strong><p>Sticky navigation stays visible for long form content.</p></section>
          <div class="spacer"></div>
          <section id="menu-b" class="status-card"><strong>Selectors</strong><p>Mix semantic roles, test IDs, and intentionally poor selectors.</p></section>
          <div class="spacer"></div>
          <section id="menu-c" class="status-card"><strong>Recovery</strong><p>Observe retries, flake handling, and consistent debug output.</p></section>
          <div class="spacer"></div>
          <section class="status-card"><strong>More Content</strong><p>Additional vertical space to make scrolling obvious on desktop and mobile.</p></section>
        </div>
      `
    )}
  `;
}

function renderApiUi() {
  return `
    <div class="component-grid">
      ${card(
        "Fetch Data",
        "Call the local seed endpoint and inspect loading and success states.",
        `
          <div class="button-row">
            <button class="primary" type="button" data-action="fetch-api">Fetch API data</button>
            <button class="secondary" type="button" data-action="fetch-api-error">Fetch error state</button>
          </div>
        `
      )}
      ${card(
        "Mutation Action",
        "Posts a mutation payload to the local server.",
        `
          <button class="primary" type="button" data-action="mutate-api">Run mutation</button>
          ${
            state.ui.lastApiResponse
              ? `<pre class="code-block">${escapeHtml(prettyJson(state.ui.lastApiResponse))}</pre>`
              : "<p>No API response captured yet.</p>"
          }
          ${state.ui.apiError ? `<p class="status-chip danger">${escapeHtml(state.ui.apiError)}</p>` : ""}
        `
      )}
    </div>
  `;
}

function renderFlakyDelayedButton() {
  return `
    ${card(
      "Delayed Button",
      "Arm the button and wait for it to become clickable.",
      `
        <div class="notice">
          ${
            state.ui.delayedButtonReady
              ? `Button ready after ${state.ui.delayedButtonDelay}ms.`
              : "Button not armed yet."
          }
        </div>
        <div class="button-row">
          <button class="secondary" type="button" data-action="arm-delayed-button">Arm delayed button</button>
          <button class="primary" type="button" data-action="delayed-button-hit" ${state.ui.delayedButtonReady ? "" : "disabled"}>
            Click when ready
          </button>
        </div>
      `
    )}
  `;
}

function renderFlakyRace() {
  return `
    ${card(
      "Race Condition",
      "Two async branches complete at different times. Flaky mode varies the winner.",
      `
        <div class="notice">
          ${
            state.ui.raceResult
              ? `Winner: ${escapeHtml(state.ui.raceResult.winner)} (${state.ui.raceResult.left}ms vs ${state.ui.raceResult.right}ms)`
              : "No race executed yet."
          }
        </div>
        <button class="primary" type="button" data-action="start-race">Start race</button>
      `
    )}
  `;
}

function renderFlakyRerender() {
  const version = state.counters.rerenderVersion;
  const targetId = dynamicId(`rerender-target-${version}`);

  return `
    ${card(
      "Re-render DOM",
      "Rebuild the DOM subtree with a new version number and optional dynamic IDs.",
      `
        <div class="notice">
          <strong id="${targetId}">Render version ${version}</strong>
        </div>
        <button class="primary" type="button" data-action="rerender-lab">Re-render subtree</button>
      `
    )}
  `;
}

function renderFlakyToast() {
  return `
    ${card(
      "Random Toast",
      "The selected toast message changes with the seeded flaky pattern.",
      `
        <button class="primary" type="button" data-action="trigger-random-toast">Show random toast</button>
      `
    )}
  `;
}

function renderFlakyTypos() {
  const typoMode = state.admin.flakyMode;

  return `
    ${card(
      "Typos",
      "Stable mode shows corrected copy. Flaky mode introduces slight content drift.",
      `
        <label class="field">
          <span>${typoMode ? "Usrname" : "Username"}</span>
          <input type="text" placeholder="${typoMode ? "entter your usrname" : "enter your username"}" />
        </label>
        <p class="notice">${typoMode ? "The copy may shfit subtly in flaky mode." : "Copy remains stable in deterministic mode."}</p>
      `
    )}
  `;
}

function renderShopLogin() {
  return `
    ${card(
      "Shop Login",
      "Use the seeded credentials to access the product catalog.",
      `
        <form data-form="shop-login-form" class="form-grid">
          <label class="field">
            <span>Username</span>
            <input name="username" type="text" value="student" />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" value="Password123!" />
          </label>
          <button class="primary" type="submit">Enter shop</button>
        </form>
      `
    )}
  `;
}

function renderShopProducts() {
  return `
    <div class="component-grid">
      ${state.products
        .map(
          (product) => `
            <article class="card">
              <h3>${escapeHtml(product.name)}</h3>
              <p class="card-description">Seeded product for the capstone checkout flow.</p>
              <p><strong>$${product.price}</strong></p>
              <p>Stock: ${product.stock}</p>
              <button class="primary" type="button" data-action="shop-add" data-product-id="${product.id}">
                Add to cart
              </button>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderShopCart() {
  const total = cartTotal();

  return `
    ${card(
      "Cart",
      "Update quantities, remove items, and proceed to checkout.",
      `
        ${
          state.cart.length
            ? `
              <table data-testid="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${state.cart
                    .map(
                      (item) => `
                        <tr>
                          <td>${escapeHtml(item.name)}</td>
                          <td>$${item.price}</td>
                          <td>
                            <label class="field">
                              <span class="hidden">Quantity for ${escapeHtml(item.name)}</span>
                              <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.id}" />
                            </label>
                          </td>
                          <td><button class="secondary" type="button" data-action="cart-remove" data-product-id="${item.id}">Remove</button></td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
              <p><strong>Total:</strong> $${total.toFixed(2)}</p>
              <div class="button-row">
                <button class="primary" type="button" data-nav="/shop/checkout">Checkout</button>
              </div>
            `
            : "<div class=\"notice\">Cart is empty. Add products from the catalog first.</div>"
        }
      `
    )}
  `;
}

function renderShopCheckout() {
  return `
    ${card(
      "Checkout",
      "Submit shipping details to place an order and reach confirmation.",
      `
        <form data-form="checkout-form" class="form-grid" data-testid="checkout-form">
          <label class="field">
            <span>Full name</span>
            <input name="fullName" type="text" value="Student Tester" required />
          </label>
          <label class="field">
            <span>Address</span>
            <input name="address" type="text" value="123 Demo Street" required />
          </label>
          <label class="field">
            <span>Postal code</span>
            <input name="postalCode" type="text" value="10001" required />
          </label>
          <button class="primary" type="submit" ${state.cart.length ? "" : "disabled"}>Place order</button>
        </form>
      `
    )}
  `;
}

function renderShopConfirmation() {
  const order = state.orders.find((item) => item.id === state.shop.lastOrderId) || state.orders[0];

  return `
    ${card(
      "Confirmation",
      "The latest order remains available for assertion after checkout.",
      order
        ? `
          <div class="notice" data-testid="confirmation-card">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Name:</strong> ${escapeHtml(order.fullName)}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          </div>
        `
        : "<div class=\"notice\">No completed order yet. Finish the checkout flow first.</div>"
    )}
  `;
}

function renderStatusPage() {
  return `
    <div class="component-grid">
      ${card(
        "HTTP Status Simulation",
        "Probe simulated 200, 404, and 500 responses from the local server.",
        `
          <div class="button-row">
            <button class="secondary" type="button" data-action="status-200">200</button>
            <button class="secondary" type="button" data-action="status-404">404</button>
            <button class="secondary" type="button" data-action="status-500">500</button>
            <button class="secondary" type="button" data-action="status-slow">Slow load</button>
          </div>
        `
      )}
      ${card(
        "Broken Image",
        "The image endpoint intentionally fails so you can assert broken-image handling.",
        `
          <img id="broken-image" src="/broken-image.svg" alt="Broken image example" style="width:100%;border-radius:16px;" />
          <p id="broken-image-status">Waiting for image status...</p>
        `
      )}
    </div>
  `;
}

function renderKeyboard() {
  return `
    ${card(
      "Keyboard Events",
      "Focus the input to capture key presses and input events.",
      `
        <label class="field">
          <span>Keyboard capture input</span>
          <input id="keyboard-input" type="text" autocomplete="off" />
        </label>
        <p id="keyboard-status">Press a key to begin.</p>
      `
    )}
  `;
}

function renderPageEvents() {
  const query = new URLSearchParams(window.location.search);
  return `
    ${card(
      "Page Events",
      "This route records onload behavior, delayed redirects, and in-page notifications.",
      `
        ${query.get("source") === "new-tab" ? '<div class="notice">Opened from the windows route in a new tab.</div>' : ""}
        <div class="button-row">
          <button class="secondary" type="button" data-action="page-event-toast">Notification</button>
          <button class="secondary" type="button" data-action="page-event-redirect">Delayed redirect</button>
        </div>
      `
    )}
  `;
}

function renderGeolocation() {
  return `
    ${card(
      "Geolocation",
      "Simulate a location lookup or use the browser geolocation API when available.",
      `
        <label class="field">
          <span>Preset location</span>
          <select id="geo-select">
            <option value="40.7128,-74.0060">New York City</option>
            <option value="47.6062,-122.3321">Seattle</option>
            <option value="37.7749,-122.4194">San Francisco</option>
          </select>
        </label>
        <div class="button-row">
          <button class="primary" type="button" data-action="simulate-location">Use preset</button>
          <button class="secondary" type="button" data-action="browser-location">Use browser geolocation</button>
        </div>
        ${
          state.ui.geo
            ? `<pre class="code-block">${escapeHtml(prettyJson(state.ui.geo))}</pre>`
            : "<p>No coordinates captured yet.</p>"
        }
      `
    )}
  `;
}

function renderCoverageIndex() {
  return `
    ${card(
      "Coverage Index",
      "Maps the PRS and Heroku parity features to the implemented routes.",
      `
        <table data-testid="coverage-index-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Route</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${COVERAGE_MAP
              .map(
                (item) => `
                  <tr>
                    <td>${escapeHtml(item.feature)}</td>
                    <td><a href="${item.route}" data-nav="${item.route}">${escapeHtml(item.route)}</a></td>
                    <td>${escapeHtml(item.status)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `
    )}
  `;
}

function renderNotFound() {
  return `
    ${card(
      "Route Not Found",
      "Use the sidebar to return to a valid scenario.",
      linkList([
        { path: "/", label: "Home" },
        { path: "/coverage-index", label: "Coverage Index" }
      ])
    )}
  `;
}

function renderRouteContent(route) {
  switch (route.path) {
    case "/":
      return renderHome();
    case "/admin":
      return renderAdmin();
    case "/basic-elements":
      return renderBasicElements();
    case "/selection-controls":
      return renderSelectionControls();
    case "/buttons":
      return renderButtons();
    case "/dialogs":
      return renderDialogs();
    case "/forms":
    case "/tables":
    case "/dynamic":
    case "/frames":
    case "/interactions":
    case "/files":
    case "/auth":
    case "/scrolling":
    case "/flaky":
    case "/shop":
      return sectionIndexRoute(route);
    case "/forms/login":
      return renderLoginForm();
    case "/forms/register":
      return renderRegisterForm();
    case "/forms/forgot-password":
      return renderForgotPasswordForm();
    case "/tables/static":
      return renderStaticTable();
    case "/tables/sortable":
      return renderSortableTable();
    case "/tables/paginated":
      return renderPaginatedTable();
    case "/tables/editable":
      return renderEditableTable();
    case "/dynamic/loading":
      return renderLoadingScenario();
    case "/dynamic/delayed-content":
      return renderDelayedContent();
    case "/dynamic/controls":
      return renderDynamicControls();
    case "/dynamic/disappearing":
      return renderDisappearingElements();
    case "/frames/editor":
      return renderFramesEditor();
    case "/frames/nested":
      return renderFramesNested();
    case "/windows":
      return renderWindows();
    case "/interactions/drag-drop":
      return renderDragDrop();
    case "/interactions/hover":
      return renderHoverActions();
    case "/interactions/slider":
      return renderSlider();
    case "/interactions/menu":
      return renderMenu();
    case "/files/upload":
      return renderUpload();
    case "/files/download":
      return renderDownload();
    case "/advanced-locators":
      return renderAdvancedLocators();
    case "/auth/basic":
      return renderBasicAuth();
    case "/auth/session":
      return renderSessionAuth();
    case "/auth/protected":
      return renderProtectedPage();
    case "/scrolling/infinite":
      return renderInfiniteScroll();
    case "/scrolling/lazy-images":
      return renderLazyImages();
    case "/scrolling/floating-menu":
      return renderFloatingMenu();
    case "/api-ui":
      return renderApiUi();
    case "/flaky/delayed-button":
      return renderFlakyDelayedButton();
    case "/flaky/race-condition":
      return renderFlakyRace();
    case "/flaky/re-render":
      return renderFlakyRerender();
    case "/flaky/random-toast":
      return renderFlakyToast();
    case "/flaky/typos":
      return renderFlakyTypos();
    case "/shop/login":
      return renderShopLogin();
    case "/shop/products":
      return renderShopProducts();
    case "/shop/cart":
      return renderShopCart();
    case "/shop/checkout":
      return renderShopCheckout();
    case "/shop/confirmation":
      return renderShopConfirmation();
    case "/status":
      return renderStatusPage();
    case "/keyboard":
      return renderKeyboard();
    case "/page-events":
      return renderPageEvents();
    case "/geolocation":
      return renderGeolocation();
    case "/coverage-index":
      return renderCoverageIndex();
    default:
      return renderNotFound();
  }
}

function renderSidebar() {
  const groups = new Map();
  ROUTES.filter((route) => route.nav !== false).forEach((route) => {
    if (!groups.has(route.group)) {
      groups.set(route.group, []);
    }
    groups.get(route.group).push(route);
  });

  refs.sidebar.innerHTML = NAV_GROUP_ORDER.filter((group) => groups.has(group))
    .map(
      (group) => `
        <section class="nav-group">
          <h3>${escapeHtml(group)}</h3>
          ${groups
            .get(group)
            .map(
              (route) => `
                <a
                  href="${route.path}"
                  class="nav-link ${getCurrentPath() === route.path ? "active" : ""}"
                  data-nav="${route.path}"
                  data-testid="nav-${route.path.replaceAll("/", "-") || "home"}"
                >
                  ${escapeHtml(route.label)}
                </a>
              `
            )
            .join("")}
        </section>
      `
    )
    .join("");
}

function renderHeroBadges(route) {
  const badges = [
    { label: state.admin.stableMode ? "Stable mode" : "Stable off" },
    { label: state.admin.flakyMode ? "Flaky mode" : "Flaky off", className: state.admin.flakyMode ? "warning" : "" },
    { label: state.admin.slowNetwork ? "Slow network" : "Normal latency", className: state.admin.slowNetwork ? "warning" : "" },
    { label: state.admin.dynamicIds ? "Dynamic IDs" : "Stable IDs", className: state.admin.dynamicIds ? "warning" : "" },
    { label: `Cart ${cartItemCount()}` }
  ];

  refs.heroBadges.innerHTML = badges
    .map((badge) => `<span class="hero-badge ${badge.className || ""}">${escapeHtml(badge.label)}</span>`)
    .join("");
  refs.pageGroup.textContent = route.group;
}

function renderOutput() {
  refs.outputRouteChip.textContent = state.output.title;
  refs.outputContent.textContent = prettyJson(state.output.payload);
}

function renderDebug() {
  refs.debugContent.innerHTML = `
    <pre class="debug-block">${escapeHtml(
      prettyJson({
        route: getCurrentPath(),
        admin: state.admin,
        auth: state.auth,
        cartItems: cartItemCount(),
        orders: state.orders.length,
        interactionCount: state.counters.interactions,
        navHistory: state.navHistory.slice(0, 5),
        recentLogs: state.logs.slice(0, 5)
      })
    )}</pre>
  `;
}

function renderToasts() {
  refs.toastRegion.innerHTML = `
    <div class="toast-stack">
      ${state.ui.toasts
        .map(
          (toast) => `
            <div class="toast">
              <strong>${escapeHtml(toast.title)}</strong>
              <span>${escapeHtml(toast.message)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderModals() {
  if (!state.ui.activeModal) {
    refs.modalRoot.innerHTML = "";
    return;
  }

  const titles = {
    standard: "Scenario Modal",
    nested: "Nested Modal",
    entry: "Entry Modal",
    exit: "Exit Intent Modal"
  };

  const bodies = {
    standard: "This modal is intended for open, close, focus, and accessibility automation checks.",
    nested: "Open a child modal from here to practice stacked overlays.",
    entry: "Welcome to the playground. Use the sidebar to explore the scenario families.",
    exit: "Looks like the cursor left the page. This exit-intent modal is ready for assertions."
  };

  refs.modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${escapeHtml(titles[state.ui.activeModal])}</h3>
        <p>${escapeHtml(bodies[state.ui.activeModal])}</p>
        <div class="button-row">
          ${
            state.ui.activeModal === "nested"
              ? '<button class="secondary" type="button" data-action="open-nested-child">Open nested child</button>'
              : ""
          }
          <button class="primary" type="button" data-action="close-modal">Close</button>
        </div>
        ${
          state.ui.nestedModal
            ? `
              <div class="notice" style="margin-top:1rem;">
                Nested child modal content is visible.
                <div class="button-row">
                  <button class="secondary" type="button" data-action="close-nested-child">Close child modal</button>
                </div>
              </div>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function applyRouteSetup(route) {
  if (route.path === "/dialogs" && !state.ui.entryModalSeen) {
    state.ui.entryModalSeen = true;
    state.ui.activeModal = "entry";
    saveState();
    renderModals();
  }

  if (route.path === "/frames/editor") {
    const frame = document.getElementById("editor-frame");
    if (frame) {
      frame.srcdoc = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 16px;">
            <h2>Editable Frame</h2>
            <div contenteditable="true" style="border: 1px solid #ccc; border-radius: 8px; min-height: 120px; padding: 12px;">
              Edit this rich text block inside the iframe.
            </div>
          </body>
        </html>
      `;
    }
  }

  if (route.path === "/frames/nested") {
    const nested = document.getElementById("nested-frame");
    if (nested) {
      nested.srcdoc = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 16px;">
            <h2>Outer Frame</h2>
            <iframe
              title="Inner nested frame"
              style="width:100%;min-height:180px;border:1px solid #ccc;border-radius:8px;"
              srcdoc="<html><body style='font-family: Arial, sans-serif; padding: 16px;'><h3>Inner Frame</h3><p>Nested frame content is ready.</p></body></html>"
            ></iframe>
          </body>
        </html>
      `;
    }
  }

  if (route.path === "/advanced-locators") {
    const host = document.getElementById("shadow-host");
    if (host && !host.shadowRoot) {
      const root = host.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>
          .shadow-card { padding: 16px; border-radius: 14px; background: #ecfeff; color: #134e4a; }
          button { padding: 10px 14px; border-radius: 999px; border: 0; background: #0f766e; color: white; }
        </style>
        <div class="shadow-card">
          <p>Shadow DOM content</p>
          <button data-testid="shadow-button">Shadow button</button>
        </div>
      `;
    }
  }

  if (route.path === "/scrolling/lazy-images") {
    const images = [...document.querySelectorAll("[data-lazy-image]")];
    if (images.length) {
      runtime.lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            runtime.lazyObserver.unobserve(img);
          }
        });
      });
      images.forEach((image) => runtime.lazyObserver.observe(image));
    }
  }

  if (route.path === "/keyboard") {
    const input = document.getElementById("keyboard-input");
    const status = document.getElementById("keyboard-status");
    if (input && status) {
      const update = (label) => {
        status.textContent = label;
        setOutput("Keyboard event", { status: label, value: input.value });
      };
      listen(input, "keydown", (event) => update(`keydown: ${event.key}`));
      listen(input, "keyup", (event) => update(`keyup: ${event.key}`));
      listen(input, "input", () => update(`input: ${input.value}`));
    }
  }

  if (route.path === "/page-events") {
    logEvent("Page loaded", { path: route.path });
    const query = new URLSearchParams(window.location.search);
    if (query.get("source") === "new-tab") {
      notify("New tab", "The page-events route opened in a separate tab.");
    }
  }

  if (route.path === "/status") {
    const brokenImage = document.getElementById("broken-image");
    const brokenStatus = document.getElementById("broken-image-status");
    if (brokenImage && brokenStatus) {
      listen(brokenImage, "error", () => {
        brokenStatus.textContent = "Broken image detected as expected.";
      });
      listen(brokenImage, "load", () => {
        brokenStatus.textContent = "Image loaded unexpectedly.";
      });
    }
  }

  if (route.path === "/scrolling/infinite") {
    const box = document.getElementById("infinite-scroll-box");
    if (box) {
      listen(box, "scroll", () => {
        if (box.scrollTop + box.clientHeight >= box.scrollHeight - 20) {
          loadMoreInfinite();
        }
      });
    }
  }
}

async function fetchJson(url, options = {}) {
  const delay = scenarioDelayMs(url, 220, 900);
  await sleep(delay);
  const response = await fetch(url, options);
  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = { message: response.statusText };
    }
    throw new Error(payload.message || `Request failed with ${response.status}`);
  }
  return response.json();
}

function updateState(mutator, rerender = false) {
  mutator(state);
  saveState();
  renderOutput();
  renderDebug();
  renderHeroBadges(resolveRoute(getCurrentPath()));
  renderToasts();
  renderModals();
  if (rerender) {
    renderRoute();
  }
}

function resolveRoute(path) {
  return ROUTE_MAP.get(path) || {
    path,
    label: "Not Found",
    title: "Not Found",
    description: "This route is not defined in the playground.",
    group: "Overview"
  };
}

function navigate(path, replace = false) {
  const target = normalizePath(path);
  if (target === getCurrentPath() && !window.location.search) {
    renderRoute();
    return;
  }
  if (replace) {
    window.history.replaceState({}, "", target);
  } else {
    window.history.pushState({}, "", target);
  }
  renderRoute();
}

function renderRoute() {
  clearCleanup();
  const route = resolveRoute(getCurrentPath());
  rememberNavigation(route.path);
  refs.pageTitle.textContent = route.title;
  refs.pageDescription.textContent = route.description;
  refs.componentArea.innerHTML = renderRouteContent(route);
  renderSidebar();
  renderHeroBadges(route);
  renderOutput();
  renderDebug();
  renderToasts();
  renderModals();
  applyRouteSetup(route);
}

function resetAppState() {
  state = createDefaultState();
  saveState();
  setOutput("Reset complete", {
    message: "Application state restored to defaults.",
    credentials: { username: "student", password: "Password123!" }
  });
  fetch("/api/reset", { method: "POST" }).catch(() => {});
  notify("Reset", "The playground has been reset.");
  renderRoute();
}

function parseForm(form) {
  const data = new FormData(form);
  const object = {};

  for (const [key, value] of data.entries()) {
    if (object[key] !== undefined) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    } else {
      object[key] = value;
    }
  }

  return object;
}

function authenticate(username, password) {
  return state.users.some((user) => user.username === username && user.password === password);
}

function loadMoreInfinite() {
  const max = 40;
  if (state.ui.scrollingCount >= max) {
    return;
  }
  state.ui.scrollingCount = Math.min(max, state.ui.scrollingCount + 4);
  saveState();
  renderRoute();
}

function handleClick(event) {
  const navTarget = event.target.closest("[data-nav]");
  if (navTarget) {
    event.preventDefault();
    const path = navTarget.getAttribute("data-nav");
    navigate(path);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    if (!event.target.closest(".custom-menu")) {
      state.ui.customMenu = null;
      saveState();
      renderRoute();
    }
    return;
  }

  const action = actionTarget.dataset.action;

  if (action === "reset-app") {
    resetAppState();
    return;
  }

  if (action === "load-dynamic-options") {
    state.dynamic.optionsLoaded = true;
    saveState();
    logEvent("Dynamic options loaded");
    setOutput("Dynamic dropdown loaded", {
      options: ["Delayed Smoke Test", "Delayed API Contract", "Delayed Shop Journey"]
    });
    renderRoute();
    return;
  }

  if (action === "count-click") {
    state.counters.clickCount += 1;
    saveState();
    logEvent("Click button pressed", { count: state.counters.clickCount });
    setOutput("Click event", { clicks: state.counters.clickCount });
    renderRoute();
    return;
  }

  if (action === "hover-reveal") {
    logEvent("Hover action used");
    setOutput("Hover action", { status: "Hover-revealed button clicked" });
    notify("Hover action", "The reveal button was activated.");
    return;
  }

  if (action === "add-button-clone") {
    state.counters.buttonListCount += 1;
    saveState();
    logEvent("Dynamic element added", { count: state.counters.buttonListCount });
    renderRoute();
    return;
  }

  if (action === "remove-button-clone") {
    state.counters.buttonListCount = Math.max(0, state.counters.buttonListCount - 1);
    saveState();
    logEvent("Dynamic element removed", { count: state.counters.buttonListCount });
    renderRoute();
    return;
  }

  if (action === "clone-press") {
    const cloneId = actionTarget.dataset.clone;
    logEvent("Dynamic clone clicked", { cloneId });
    setOutput("Dynamic button clicked", { cloneId });
    return;
  }

  if (action === "open-modal") {
    state.ui.activeModal = actionTarget.dataset.modal;
    state.ui.nestedModal = false;
    saveState();
    renderModals();
    return;
  }

  if (action === "open-nested-child") {
    state.ui.nestedModal = true;
    saveState();
    renderModals();
    return;
  }

  if (action === "close-nested-child") {
    state.ui.nestedModal = false;
    saveState();
    renderModals();
    return;
  }

  if (action === "close-modal") {
    state.ui.activeModal = null;
    state.ui.nestedModal = false;
    saveState();
    renderModals();
    return;
  }

  if (action === "show-alert") {
    window.alert("Automation playground alert");
    setOutput("Alert shown", { message: "Automation playground alert" });
    return;
  }

  if (action === "show-confirm") {
    const accepted = window.confirm("Approve this automation scenario?");
    setOutput("Confirm handled", { accepted });
    return;
  }

  if (action === "show-prompt") {
    const response = window.prompt("Name this automation run", "Smoke Run");
    setOutput("Prompt handled", { response });
    return;
  }

  if (action === "show-toast") {
    notify(actionTarget.dataset.toastTitle || "Toast", actionTarget.dataset.toastMessage || "A toast message appeared.");
    return;
  }

  if (action === "prefill-invalid-login") {
    const form = document.querySelector('[data-form="login-form"]');
    if (form) {
      form.elements.username.value = "invalid";
      form.elements.password.value = "bad-password";
    }
    return;
  }

  if (action === "sort-table") {
    const key = actionTarget.dataset.key;
    if (state.tables.sortKey === key) {
      state.tables.sortDirection = state.tables.sortDirection === "asc" ? "desc" : "asc";
    } else {
      state.tables.sortKey = key;
      state.tables.sortDirection = "asc";
    }
    saveState();
    logEvent("Table sorted", { key: state.tables.sortKey, direction: state.tables.sortDirection });
    renderRoute();
    return;
  }

  if (action === "page-prev") {
    state.tables.page = Math.max(1, state.tables.page - 1);
    saveState();
    renderRoute();
    return;
  }

  if (action === "page-next") {
    state.tables.page = Math.min(Math.ceil(AUDIT_ROWS.length / 5), state.tables.page + 1);
    saveState();
    renderRoute();
    return;
  }

  if (action === "trigger-spinner") {
    state.dynamic.spinnerLoaded = false;
    saveState();
    setOutput("Loading started", { delayMs: scenarioDelayMs("spinner", 500, 1200) });
    const delay = scenarioDelayMs("spinner", 500, 1200);
    window.setTimeout(() => {
      state.dynamic.spinnerLoaded = true;
      saveState();
      setOutput("Loading complete", { message: "Spinner finished", delayMs: delay });
      renderRoute();
    }, delay);
    return;
  }

  if (action === "trigger-delayed-content") {
    state.dynamic.delayedVisible = false;
    saveState();
    const delay = scenarioDelayMs("delayed-content", 450, 1100);
    window.setTimeout(() => {
      state.dynamic.delayedVisible = true;
      saveState();
      setOutput("Delayed content", { visible: true, delayMs: delay });
      renderRoute();
    }, delay);
    return;
  }

  if (action === "toggle-controls") {
    state.dynamic.controlsEnabled = !state.dynamic.controlsEnabled;
    saveState();
    setOutput("Dynamic controls toggled", { controlsEnabled: state.dynamic.controlsEnabled });
    renderRoute();
    return;
  }

  if (action === "toggle-disappearing") {
    if (state.dynamic.disappearingVisible) {
      const delay = scenarioDelayMs("disappearing", 450, 900);
      window.setTimeout(() => {
        state.dynamic.disappearingVisible = false;
        saveState();
        setOutput("Element disappeared", { visible: false, delayMs: delay });
        renderRoute();
      }, delay);
    } else {
      state.dynamic.disappearingVisible = true;
      saveState();
      renderRoute();
    }
    return;
  }

  if (action === "open-new-tab") {
    logEvent("New tab requested");
    window.open("/page-events?source=new-tab", "_blank", "noopener");
    return;
  }

  if (action === "trigger-redirect") {
    window.location.href = "/redirect-demo";
    return;
  }

  if (action === "menu-pick") {
    const item = actionTarget.dataset.item;
    setOutput("Menu selection", { item });
    notify("Menu selection", `${item} selected.`);
    return;
  }

  if (action === "fetch-api") {
    setOutput("API loading", { message: "Fetching seed data..." });
    fetchJson("/api/seed")
      .then((payload) => {
        state.ui.lastApiResponse = payload;
        state.ui.apiError = null;
        saveState();
        setOutput("API success", payload);
        renderRoute();
      })
      .catch((error) => {
        state.ui.apiError = error.message;
        saveState();
        setOutput("API error", { message: error.message });
        renderRoute();
      });
    return;
  }

  if (action === "fetch-api-error") {
    setOutput("API loading", { message: "Fetching error route..." });
    fetchJson("/api/status/500")
      .then((payload) => {
        state.ui.lastApiResponse = payload;
        state.ui.apiError = null;
        saveState();
        renderRoute();
      })
      .catch((error) => {
        state.ui.apiError = error.message;
        saveState();
        setOutput("API error", { message: error.message });
        renderRoute();
      });
    return;
  }

  if (action === "mutate-api") {
    setOutput("Mutation loading", { message: "Posting mutation..." });
    fetchJson("/api/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve-run", route: getCurrentPath() })
    })
      .then((payload) => {
        state.ui.lastApiResponse = payload;
        state.ui.apiError = null;
        saveState();
        setOutput("Mutation success", payload);
        renderRoute();
      })
      .catch((error) => {
        state.ui.apiError = error.message;
        saveState();
        setOutput("Mutation error", { message: error.message });
        renderRoute();
      });
    return;
  }

  if (action === "arm-delayed-button") {
    state.ui.delayedButtonReady = false;
    const delay = scenarioDelayMs("delayed-button", 700, 1500);
    state.ui.delayedButtonDelay = delay;
    saveState();
    window.setTimeout(() => {
      state.ui.delayedButtonReady = true;
      saveState();
      notify("Delayed button ready", `The button is now clickable after ${delay}ms.`);
      renderRoute();
    }, delay);
    renderRoute();
    return;
  }

  if (action === "delayed-button-hit") {
    setOutput("Delayed button clicked", {
      ready: state.ui.delayedButtonReady,
      delayMs: state.ui.delayedButtonDelay
    });
    notify("Success", "Delayed button clicked.");
    return;
  }

  if (action === "start-race") {
    const left = scenarioDelayMs("race-left", 320, 900);
    const right = scenarioDelayMs("race-right", 340, 900);
    state.ui.raceResult = {
      left,
      right,
      winner: left <= right ? "left branch" : "right branch"
    };
    saveState();
    setOutput("Race condition", state.ui.raceResult);
    renderRoute();
    return;
  }

  if (action === "rerender-lab") {
    state.counters.rerenderVersion += 1;
    saveState();
    setOutput("DOM rerendered", { version: state.counters.rerenderVersion });
    renderRoute();
    return;
  }

  if (action === "trigger-random-toast") {
    const messages = [
      "Retry succeeded.",
      "An async branch resolved.",
      "A selector had to recover.",
      "A random toast appeared."
    ];
    const message = messages[Math.floor(randomUnit("toast-seed") * messages.length)];
    notify("Flaky toast", message);
    setOutput("Random toast", { message });
    return;
  }

  if (action === "shop-add") {
    const product = findProduct(actionTarget.dataset.productId);
    if (!product) {
      return;
    }
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    saveState();
    notify("Cart updated", `${product.name} added to cart.`);
    setOutput("Cart updated", state.cart);
    renderRoute();
    return;
  }

  if (action === "cart-remove") {
    const productId = Number(actionTarget.dataset.productId);
    state.cart = state.cart.filter((item) => item.id !== productId);
    saveState();
    setOutput("Cart updated", state.cart);
    renderRoute();
    return;
  }

  if (action === "load-more-infinite") {
    loadMoreInfinite();
    return;
  }

  if (action === "scroll-to-anchor") {
    const anchor = document.getElementById(actionTarget.dataset.anchor);
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (action === "status-200") {
    setOutput("Status 200", { status: 200, message: "Healthy response" });
    return;
  }

  if (action === "status-404") {
    fetch("/api/status/404")
      .then((response) => response.json().then((body) => ({ status: response.status, body })))
      .then((payload) => setOutput("Status 404", payload));
    return;
  }

  if (action === "status-500") {
    fetch("/api/status/500")
      .then((response) => response.json().then((body) => ({ status: response.status, body })))
      .then((payload) => setOutput("Status 500", payload));
    return;
  }

  if (action === "status-slow") {
    const delay = scenarioDelayMs("slow-status", 950, 900);
    setOutput("Slow load started", { delayMs: delay });
    window.setTimeout(() => {
      setOutput("Slow load complete", { delayMs: delay });
    }, delay);
    return;
  }

  if (action === "page-event-toast") {
    notify("Page event", "In-page notification triggered.");
    return;
  }

  if (action === "page-event-redirect") {
    const delay = scenarioDelayMs("page-event-redirect", 700, 700);
    setOutput("Redirect scheduled", { delayMs: delay, target: "/status" });
    window.setTimeout(() => navigate("/status"), delay);
    return;
  }

  if (action === "simulate-location") {
    const value = document.getElementById("geo-select")?.value;
    if (!value) {
      return;
    }
    const [latitude, longitude] = value.split(",");
    state.ui.geo = {
      source: "preset",
      latitude: Number(latitude),
      longitude: Number(longitude)
    };
    saveState();
    setOutput("Geolocation", state.ui.geo);
    renderRoute();
    return;
  }

  if (action === "browser-location") {
    if (!navigator.geolocation) {
      notify("Geolocation unavailable", "Browser geolocation is not available here.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.ui.geo = {
          source: "browser",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        saveState();
        setOutput("Geolocation", state.ui.geo);
        renderRoute();
      },
      (error) => {
        setOutput("Geolocation error", { message: error.message });
      }
    );
  }
}

function handleSubmit(event) {
  const form = event.target.closest("[data-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  const formName = form.dataset.form;
  const payload = parseForm(form);

  if (formName === "basic-elements-form") {
    setOutput("Basic elements submitted", payload);
    logEvent("Basic form submitted", payload);
    return;
  }

  if (formName === "selection-controls-form") {
    const suites = new FormData(form).getAll("suites");
    const features = new FormData(form).getAll("features");
    setOutput("Selection controls submitted", { ...payload, suites, features });
    logEvent("Selection form submitted", { suites, features });
    return;
  }

  if (formName === "login-form") {
    const success = authenticate(payload.username, payload.password);
    setOutput("Login result", { success, username: payload.username });
    notify("Login", success ? "Login succeeded." : "Login failed.");
    return;
  }

  if (formName === "register-form") {
    const password = String(payload.password || "");
    const confirm = String(payload.confirmPassword || "");
    const exists = state.users.some((user) => user.username === payload.username);
    const valid = password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password) && password === confirm && !exists;
    if (valid) {
      state.users.push({ username: payload.username, password });
      saveState();
      notify("Register", "Account created successfully.");
    }
    setOutput("Register result", {
      valid,
      exists,
      passwordStrength: password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password),
      passwordsMatch: password === confirm
    });
    return;
  }

  if (formName === "forgot-password-form") {
    setOutput("Password reset requested", payload);
    notify("Forgot password", "Reset email queued.");
    return;
  }

  if (formName === "basic-auth-form") {
    state.auth.basicGranted = authenticate(payload.username, payload.password);
    saveState();
    setOutput("Basic auth result", { granted: state.auth.basicGranted });
    renderRoute();
    return;
  }

  if (formName === "session-auth-form") {
    state.auth.sessionLoggedIn = authenticate(payload.username, payload.password);
    saveState();
    setOutput("Session auth result", { loggedIn: state.auth.sessionLoggedIn });
    renderRoute();
    return;
  }

  if (formName === "shop-login-form") {
    state.auth.shopLoggedIn = authenticate(payload.username, payload.password);
    saveState();
    setOutput("Shop login result", { loggedIn: state.auth.shopLoggedIn });
    if (state.auth.shopLoggedIn) {
      navigate("/shop/products");
    } else {
      notify("Shop login", "Invalid shop credentials.");
      renderRoute();
    }
    return;
  }

  if (formName === "editable-table-form") {
    state.tables.editableRows = state.tables.editableRows.map((row) => ({
      ...row,
      quantity: Number(payload[`quantity-${row.id}`])
    }));
    saveState();
    setOutput("Editable table saved", state.tables.editableRows);
    renderRoute();
    return;
  }

  if (formName === "checkout-form") {
    if (!state.cart.length) {
      setOutput("Checkout blocked", { message: "Cart is empty." });
      return;
    }
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      fullName: payload.fullName,
      address: payload.address,
      postalCode: payload.postalCode,
      total: cartTotal(),
      items: clone(state.cart)
    };
    state.orders.unshift(order);
    state.shop.lastOrderId = order.id;
    state.cart = [];
    saveState();
    notify("Order placed", "Checkout completed successfully.");
    setOutput("Order confirmation", order);
    navigate("/shop/confirmation");
  }
}

function handleChange(event) {
  const target = event.target;

  if (target.classList.contains("admin-toggle")) {
    const { name, checked } = target;
    if (name === "stableMode") {
      state.admin.stableMode = checked;
      if (checked) {
        state.admin.flakyMode = false;
      }
    } else if (name === "flakyMode") {
      state.admin.flakyMode = checked;
      if (checked) {
        state.admin.stableMode = false;
      } else if (!state.admin.stableMode) {
        state.admin.stableMode = true;
      }
    } else {
      state.admin[name] = checked;
    }
    saveState();
    logEvent("Admin toggles changed", state.admin);
    renderRoute();
    return;
  }

  if (target.id === "upload-input") {
    const files = [...target.files].map((file) => ({ name: file.name, size: file.size, type: file.type }));
    setOutput("Upload selected", files);
    logEvent("Files selected", { files });
    return;
  }

  if (target.dataset.cartQty) {
    const item = state.cart.find((cartItem) => cartItem.id === Number(target.dataset.cartQty));
    if (item) {
      item.quantity = Math.max(1, Number(target.value));
      saveState();
      setOutput("Cart quantity updated", state.cart);
      renderRoute();
    }
    return;
  }
}

function handleReset(event) {
  const form = event.target.closest("[data-form='basic-elements-form']");
  if (form) {
    window.setTimeout(() => {
      setOutput("Basic elements reset", parseForm(form));
    }, 0);
  }
}

function handleDoubleClick(event) {
  if (event.target.id === "double-click-target") {
    state.counters.doubleClickCount += 1;
    saveState();
    setOutput("Double click", { count: state.counters.doubleClickCount });
    renderRoute();
  }
}

function handleContextMenu(event) {
  const zone = event.target.closest("#context-zone");
  if (!zone) {
    return;
  }
  event.preventDefault();
  state.ui.customMenu = { x: event.clientX, y: event.clientY };
  saveState();
  const anchor = document.getElementById("context-menu-anchor");
  if (anchor) {
    anchor.innerHTML = `
      <div class="custom-menu" style="top:${event.clientY}px;left:${event.clientX}px;">
        <button type="button" data-action="show-toast" data-toast-title="Context Menu" data-toast-message="Inspect clicked">Inspect</button>
        <button type="button" data-action="show-toast" data-toast-title="Context Menu" data-toast-message="Delete clicked">Delete</button>
      </div>
    `;
  }
}

function handleMouseDown(event) {
  const target = event.target.closest("[data-long-press]");
  if (!target) {
    return;
  }
  runtime.longPressTimer = window.setTimeout(() => {
    state.counters.longPressCount += 1;
    saveState();
    setOutput("Long press", { count: state.counters.longPressCount });
    renderRoute();
    runtime.longPressTimer = null;
  }, 700);
}

function handleMouseUp() {
  if (runtime.longPressTimer) {
    window.clearTimeout(runtime.longPressTimer);
    runtime.longPressTimer = null;
  }
}

function handleDragStart(event) {
  if (event.target.id === "drag-token") {
    event.dataTransfer.setData("text/plain", "drag-token");
  }
}

function handleDragOver(event) {
  if (event.target.closest("#drop-target")) {
    event.preventDefault();
  }
}

function handleDrop(event) {
  const target = event.target.closest("#drop-target");
  if (!target) {
    return;
  }
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  target.textContent = `Dropped: ${data}`;
  setOutput("Drag and drop", { dropped: data });
}

const ROUTES = [
  { path: "/", label: "Home", title: "Home", description: "Launch point for the automation playground and global state overview.", group: "Overview" },
  { path: "/admin", label: "Admin", title: "Admin Controls", description: "Reset the app state and tune stable, flaky, slow, and dynamic-ID modes.", group: "Overview" },
  { path: "/coverage-index", label: "Coverage Index", title: "Coverage Index", description: "PRS mapping between Heroku-style scenarios and implemented routes.", group: "Overview" },
  { path: "/basic-elements", label: "Basic Elements", title: "Basic Elements", description: "Foundational inputs, submit/reset flows, and simple content assertions.", group: "Core" },
  { path: "/selection-controls", label: "Selection Controls", title: "Selection Controls", description: "Checkboxes, radios, single/multi-selects, and delayed dropdown options.", group: "Core" },
  { path: "/buttons", label: "Buttons", title: "Buttons", description: "Click, double-click, right-click, hover reveal, and long-press scenarios.", group: "Core" },
  { path: "/dialogs", label: "Dialogs", title: "Dialogs", description: "Alerts, confirms, prompts, modals, nested overlays, and toasts.", group: "Core" },
  { path: "/forms", label: "Forms Index", title: "Forms", description: "Entry point for the login, registration, and forgot-password scenarios.", group: "Forms", nav: false },
  { path: "/forms/login", label: "Login", title: "Forms: Login", description: "Username/password success and failure states.", group: "Forms", parent: "/forms" },
  { path: "/forms/register", label: "Register", title: "Forms: Register", description: "Validation rules, password confirmation, and uniqueness checks.", group: "Forms", parent: "/forms" },
  { path: "/forms/forgot-password", label: "Forgot Password", title: "Forms: Forgot Password", description: "Email submission for password-reset style automation.", group: "Forms", parent: "/forms" },
  { path: "/tables", label: "Tables Index", title: "Tables", description: "Entry point for the static, sortable, paginated, and editable table scenarios.", group: "Tables", nav: false },
  { path: "/tables/static", label: "Static Table", title: "Tables: Static", description: "Baseline table content with fixed rows and stable selectors.", group: "Tables", parent: "/tables" },
  { path: "/tables/sortable", label: "Sortable Table", title: "Tables: Sortable", description: "Interactive column sorting with stateful ordering.", group: "Tables", parent: "/tables" },
  { path: "/tables/paginated", label: "Paginated Table", title: "Tables: Paginated", description: "Client-side paging controls with multiple pages.", group: "Tables", parent: "/tables" },
  { path: "/tables/editable", label: "Editable Table", title: "Tables: Editable", description: "Inline numeric editing with save behavior.", group: "Tables", parent: "/tables" },
  { path: "/dynamic", label: "Dynamic Index", title: "Dynamic Content", description: "Entry point for loading, delayed content, enable/disable, and disappearing-element flows.", group: "Dynamic", nav: false },
  { path: "/dynamic/loading", label: "Loading Spinner", title: "Dynamic: Loading Spinner", description: "Spinner-based loading workflow with visible completion.", group: "Dynamic", parent: "/dynamic" },
  { path: "/dynamic/delayed-content", label: "Delayed Content", title: "Dynamic: Delayed Content", description: "Content revealed only after a timed wait.", group: "Dynamic", parent: "/dynamic" },
  { path: "/dynamic/controls", label: "Enable/Disable", title: "Dynamic: Enable and Disable", description: "Controls toggle between enabled and disabled states.", group: "Dynamic", parent: "/dynamic" },
  { path: "/dynamic/disappearing", label: "Disappearing", title: "Dynamic: Disappearing Elements", description: "Elements vanish after a controlled delay.", group: "Dynamic", parent: "/dynamic" },
  { path: "/frames", label: "Frames Index", title: "Frames", description: "Entry point for iframe editing and nested-frame navigation.", group: "Frames", nav: false },
  { path: "/frames/editor", label: "iFrame Editor", title: "Frames: Editor", description: "Editable same-origin iframe content.", group: "Frames", parent: "/frames" },
  { path: "/frames/nested", label: "Nested Frames", title: "Frames: Nested", description: "Outer and inner iframe traversal.", group: "Frames", parent: "/frames" },
  { path: "/windows", label: "Windows", title: "Windows", description: "New-tab behavior, redirects, and navigation tracking.", group: "Windows" },
  { path: "/interactions", label: "Interactions Index", title: "Interactions", description: "Entry point for drag-and-drop, hover, slider, and menu scenarios.", group: "Interactions", nav: false },
  { path: "/interactions/drag-drop", label: "Drag & Drop", title: "Interactions: Drag and Drop", description: "Standard drag source and drop target.", group: "Interactions", parent: "/interactions" },
  { path: "/interactions/hover", label: "Hover Actions", title: "Interactions: Hover Actions", description: "Buttons revealed by hover or focus.", group: "Interactions", parent: "/interactions" },
  { path: "/interactions/slider", label: "Slider", title: "Interactions: Slider", description: "Range input with live value updates.", group: "Interactions", parent: "/interactions" },
  { path: "/interactions/menu", label: "Multi-level Menu", title: "Interactions: Multi-level Menu", description: "Keyboard-friendly menu selection flow.", group: "Interactions", parent: "/interactions" },
  { path: "/files", label: "Files Index", title: "Files", description: "Entry point for upload and download scenarios.", group: "Files", nav: false },
  { path: "/files/upload", label: "Upload", title: "Files: Upload", description: "File upload selection with observable metadata.", group: "Files", parent: "/files" },
  { path: "/files/download", label: "Download", title: "Files: Download", description: "Download multiple file types from the local server.", group: "Files", parent: "/files" },
  { path: "/advanced-locators", label: "Advanced Locators", title: "Advanced Locators", description: "Shadow DOM, deep DOM, dynamic IDs, and duplicate labels.", group: "Locators" },
  { path: "/auth", label: "Auth Index", title: "Auth", description: "Entry point for basic auth simulation, sessions, and protected content.", group: "Auth", nav: false },
  { path: "/auth/basic", label: "Basic Auth", title: "Auth: Basic Auth", description: "Basic-auth style credential gate simulation.", group: "Auth", parent: "/auth" },
  { path: "/auth/session", label: "Session Login", title: "Auth: Session Login", description: "Persistent session login and logout controls.", group: "Auth", parent: "/auth" },
  { path: "/auth/protected", label: "Protected Page", title: "Auth: Protected Page", description: "Protected content unlocked by the session flow.", group: "Auth", parent: "/auth" },
  { path: "/scrolling", label: "Scrolling Index", title: "Scrolling", description: "Entry point for infinite scroll, lazy images, and sticky menu content.", group: "Scrolling", nav: false },
  { path: "/scrolling/infinite", label: "Infinite Scroll", title: "Scrolling: Infinite Scroll", description: "Append more content when the scroll box reaches the bottom.", group: "Scrolling", parent: "/scrolling" },
  { path: "/scrolling/lazy-images", label: "Lazy Images", title: "Scrolling: Lazy Images", description: "Images load only when observed in the viewport.", group: "Scrolling", parent: "/scrolling" },
  { path: "/scrolling/floating-menu", label: "Floating Menu", title: "Scrolling: Floating Menu", description: "Sticky section navigation inside a tall scrolling region.", group: "Scrolling", parent: "/scrolling" },
  { path: "/api-ui", label: "API UI", title: "API UI", description: "Fetch data, handle errors, and post mutations to the local server.", group: "API" },
  { path: "/flaky", label: "Flaky Index", title: "Flaky Lab", description: "Entry point for delayed buttons, races, rerenders, random toasts, and typo drift.", group: "Flaky", nav: false },
  { path: "/flaky/delayed-button", label: "Delayed Button", title: "Flaky: Delayed Button", description: "Button becomes clickable after a controlled wait.", group: "Flaky", parent: "/flaky" },
  { path: "/flaky/race-condition", label: "Race Condition", title: "Flaky: Race Condition", description: "Competing async branches create repeatable timing variance.", group: "Flaky", parent: "/flaky" },
  { path: "/flaky/re-render", label: "Re-render DOM", title: "Flaky: Re-render DOM", description: "DOM subtree replacement changes IDs and version markers.", group: "Flaky", parent: "/flaky" },
  { path: "/flaky/random-toast", label: "Random Toast", title: "Flaky: Random Toast", description: "Seeded random notifications for flake-handling demos.", group: "Flaky", parent: "/flaky" },
  { path: "/flaky/typos", label: "Typos", title: "Flaky: Typos", description: "Copy drift appears when flaky mode is enabled.", group: "Flaky", parent: "/flaky" },
  { path: "/shop", label: "Shop Index", title: "Shop Flow", description: "Entry point for the full login, product, cart, checkout, and confirmation capstone.", group: "Shop", nav: false },
  { path: "/shop/login", label: "Shop Login", title: "Shop: Login", description: "Start the capstone flow with seeded credentials.", group: "Shop", parent: "/shop" },
  { path: "/shop/products", label: "Products", title: "Shop: Products", description: "Browse the seeded product list and add items to the cart.", group: "Shop", parent: "/shop" },
  { path: "/shop/cart", label: "Cart", title: "Shop: Cart", description: "Edit quantities, remove products, and inspect totals.", group: "Shop", parent: "/shop" },
  { path: "/shop/checkout", label: "Checkout", title: "Shop: Checkout", description: "Complete the capstone order workflow.", group: "Shop", parent: "/shop" },
  { path: "/shop/confirmation", label: "Confirmation", title: "Shop: Confirmation", description: "Inspect the last completed order confirmation.", group: "Shop", parent: "/shop" },
  { path: "/status", label: "Status", title: "Status", description: "HTTP status, broken image, and slow-loading simulations.", group: "Status" },
  { path: "/keyboard", label: "Keyboard", title: "Keyboard", description: "Key press, key up, and input event coverage.", group: "Status" },
  { path: "/page-events", label: "Page Events", title: "Page Events", description: "Onload logging, delayed redirects, and notification messages.", group: "Status" },
  { path: "/geolocation", label: "Geolocation", title: "Geolocation", description: "Simulated and browser-backed location output.", group: "Status" }
];

const ROUTE_MAP = new Map(ROUTES.map((route) => [route.path, route]));

function attachGlobalListeners() {
  document.addEventListener("click", handleClick);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("change", handleChange);
  document.addEventListener("reset", handleReset);
  document.addEventListener("dblclick", handleDoubleClick);
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mouseleave", handleMouseUp);
  document.addEventListener("dragstart", handleDragStart);
  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("drop", handleDrop);
  document.addEventListener("input", (event) => {
    if (event.target.id === "slider-control") {
      const label = document.getElementById("slider-value");
      if (label) {
        label.textContent = event.target.value;
        setOutput("Slider value", { value: Number(event.target.value) });
      }
    }
  });
  window.addEventListener("popstate", renderRoute);
  document.addEventListener("mouseout", (event) => {
    if (event.relatedTarget === null && event.clientY <= 0 && !state.ui.exitModalSeen) {
      state.ui.exitModalSeen = true;
      state.ui.activeModal = "exit";
      saveState();
      renderModals();
    }
  });
}

attachGlobalListeners();
renderRoute();
