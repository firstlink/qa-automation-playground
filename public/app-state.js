export const STORAGE_KEY = "qa-automation-playground-state-v1";
export const DEFAULT_SEED = 20260420;

export const SEED_DATA = Object.freeze({
  users: Object.freeze([{ username: "student", password: "Password123!" }]),
  products: Object.freeze([
    Object.freeze({ id: 1, name: "Laptop", price: 999, stock: 6 }),
    Object.freeze({ id: 2, name: "Phone", price: 599, stock: 11 }),
    Object.freeze({ id: 3, name: "Headphones", price: 149, stock: 18 }),
    Object.freeze({ id: 4, name: "Monitor", price: 329, stock: 8 })
  ]),
  orders: Object.freeze([]),
  notifications: Object.freeze([
    "Welcome!",
    "Order placed successfully",
    "Seeded data restored."
  ])
});

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createEditableRows(products = SEED_DATA.products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    owner: product.id % 2 === 0 ? "Automation Pod" : "QA Guild",
    status: product.id % 2 === 0 ? "Ready" : "Draft",
    quantity: product.stock
  }));
}

export function createDefaultState(overrides = {}) {
  const seedData = {
    users: clone(SEED_DATA.users),
    products: clone(SEED_DATA.products),
    orders: clone(SEED_DATA.orders),
    notifications: clone(SEED_DATA.notifications)
  };

  const baseState = {
    admin: {
      stableMode: true,
      flakyMode: false,
      slowNetwork: false,
      dynamicIds: false
    },
    auth: {
      basicGranted: false,
      digestGranted: false,
      sessionLoggedIn: false,
      shopLoggedIn: false
    },
    users: seedData.users,
    products: seedData.products,
    orders: seedData.orders,
    notifications: seedData.notifications,
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
      editableRows: createEditableRows(seedData.products)
    },
    dynamic: {
      optionsLoaded: false,
      spinnerLoaded: false,
      contentVersion: 1,
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
      geo: null,
      abVariant: "A",
      notificationIndex: 0,
      shiftingContentOffset: false,
      onloadErrorCaptured: false
    },
    shop: {
      lastOrderId: null
    },
    meta: {
      lastResetAt: new Date().toISOString(),
      resetCount: 0
    },
    seed: DEFAULT_SEED
  };

  return normalizeState({ ...baseState, ...overrides });
}

function normalizeAdminState(candidate, defaults) {
  const admin = { ...defaults, ...(candidate || {}) };
  admin.stableMode = Boolean(admin.stableMode);
  admin.flakyMode = Boolean(admin.flakyMode);
  admin.slowNetwork = Boolean(admin.slowNetwork);
  admin.dynamicIds = Boolean(admin.dynamicIds);

  if (admin.flakyMode) {
    admin.stableMode = false;
  }

  if (!admin.flakyMode && !admin.stableMode) {
    admin.stableMode = true;
  }

  return admin;
}

export function normalizeState(candidate) {
  const defaults = createDefaultState.__defaults || (createDefaultState.__defaults = {
    admin: {
      stableMode: true,
      flakyMode: false,
      slowNetwork: false,
      dynamicIds: false
    },
    auth: {
      basicGranted: false,
      digestGranted: false,
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
      editableRows: createEditableRows(SEED_DATA.products)
    },
    dynamic: {
      optionsLoaded: false,
      spinnerLoaded: false,
      contentVersion: 1,
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
      geo: null,
      abVariant: "A",
      notificationIndex: 0,
      shiftingContentOffset: false,
      onloadErrorCaptured: false
    },
    shop: {
      lastOrderId: null
    },
    meta: {
      lastResetAt: null,
      resetCount: 0
    },
    seed: DEFAULT_SEED
  });

  const state = candidate && typeof candidate === "object" ? candidate : {};

  return {
    ...defaults,
    ...state,
    admin: normalizeAdminState(state.admin, defaults.admin),
    auth: { ...defaults.auth, ...(state.auth || {}) },
    counters: { ...defaults.counters, ...(state.counters || {}) },
    tables: {
      ...defaults.tables,
      ...(state.tables || {}),
      editableRows: Array.isArray(state.tables?.editableRows)
        ? state.tables.editableRows
        : clone(defaults.tables.editableRows)
    },
    dynamic: { ...defaults.dynamic, ...(state.dynamic || {}) },
    ui: {
      ...defaults.ui,
      ...(state.ui || {}),
      toasts: Array.isArray(state.ui?.toasts) ? state.ui.toasts : clone(defaults.ui.toasts)
    },
    shop: { ...defaults.shop, ...(state.shop || {}) },
    meta: { ...defaults.meta, ...(state.meta || {}) },
    users: Array.isArray(state.users) ? state.users : clone(defaults.users),
    products: Array.isArray(state.products) ? state.products : clone(defaults.products),
    orders: Array.isArray(state.orders) ? state.orders : clone(defaults.orders),
    notifications: Array.isArray(state.notifications) ? state.notifications : clone(defaults.notifications),
    cart: Array.isArray(state.cart) ? state.cart : clone(defaults.cart),
    logs: Array.isArray(state.logs) ? state.logs : clone(defaults.logs),
    navHistory: Array.isArray(state.navHistory) ? state.navHistory : clone(defaults.navHistory),
    output: state.output || clone(defaults.output),
    seed: Number.isFinite(Number(state.seed)) ? Number(state.seed) : defaults.seed
  };
}

export function resetState(previousState = null) {
  const next = createDefaultState();
  const priorResetCount = Number(previousState?.meta?.resetCount || 0);
  next.meta.resetCount = priorResetCount + 1;
  next.meta.lastResetAt = new Date().toISOString();
  return next;
}

export function createSeedSnapshot(state) {
  const current = normalizeState(state);
  return {
    seed: current.seed,
    admin: clone(current.admin),
    users: clone(current.users),
    products: clone(current.products),
    orders: clone(current.orders),
    notifications: clone(current.notifications),
    resetCount: current.meta.resetCount,
    lastResetAt: current.meta.lastResetAt
  };
}

export function hashText(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function randomUnit(state, label, counter = null) {
  const current = normalizeState(state);
  const position = counter ?? current.counters.interactions;
  return hashText(`${current.seed}:${position}:${label}`) / 4294967295;
}

export function scenarioDelayMs(state, label, base = 250, spread = 700) {
  const current = normalizeState(state);
  let delay = base;
  if (current.admin.flakyMode) {
    delay = Math.round(base + randomUnit(current, label) * spread);
  }
  if (current.admin.slowNetwork) {
    delay += 900;
  }
  return delay;
}

export function dynamicId(state, base) {
  const current = normalizeState(state);
  if (!current.admin.dynamicIds) {
    return base;
  }
  const cycle = current.counters.rerenderVersion || current.counters.interactions || 1;
  return `${base}-${hashText(`${current.seed}:${cycle}:${base}`).toString(36).slice(0, 5)}`;
}
