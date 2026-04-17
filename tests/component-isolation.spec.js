import { test, expect } from "@playwright/test";
import { gotoFresh, expectOutputContains } from "./helpers.js";

const routeSpecs = [
  {
    name: "ab testing renders independently",
    path: "/ab-testing",
    heading: "A/B Testing",
    assert: async (page) => {
      await expect(page.getByTestId("ab-testing-card")).toBeVisible();
    }
  },
  {
    name: "basic elements renders independently",
    path: "/basic-elements",
    heading: "Basic Elements",
    assert: async (page) => {
      await expect(page.getByTestId("basic-elements-form")).toBeVisible();
    }
  },
  {
    name: "selection controls renders independently",
    path: "/selection-controls",
    heading: "Selection Controls",
    assert: async (page) => {
      await expect(page.getByTestId("selection-controls-form")).toBeVisible();
    }
  },
  {
    name: "buttons renders independently",
    path: "/buttons",
    heading: "Buttons",
    assert: async (page) => {
      await expect(page.getByTestId("click-button")).toBeVisible();
      await expect(page.getByTestId("context-zone")).toBeVisible();
    }
  },
  {
    name: "dialogs renders independently",
    path: "/dialogs",
    heading: "Dialogs",
    assert: async (page) => {
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("button", { name: "Close" }).click();
      await expect(page.getByRole("button", { name: "Alert" })).toBeVisible();
    }
  },
  {
    name: "login form renders independently",
    path: "/forms/login",
    heading: "Forms: Login",
    assert: async (page) => {
      await expect(page.getByTestId("login-form")).toBeVisible();
    }
  },
  {
    name: "register form renders independently",
    path: "/forms/register",
    heading: "Forms: Register",
    assert: async (page) => {
      await expect(page.getByTestId("register-form")).toBeVisible();
    }
  },
  {
    name: "forgot password renders independently",
    path: "/forms/forgot-password",
    heading: "Forms: Forgot Password",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
    }
  },
  {
    name: "static table renders independently",
    path: "/tables/static",
    heading: "Tables: Static",
    assert: async (page) => {
      await expect(page.getByTestId("static-table")).toBeVisible();
    }
  },
  {
    name: "sortable table renders independently",
    path: "/tables/sortable",
    heading: "Tables: Sortable",
    assert: async (page) => {
      await expect(page.getByTestId("sortable-table")).toBeVisible();
    }
  },
  {
    name: "paginated table renders independently",
    path: "/tables/paginated",
    heading: "Tables: Paginated",
    assert: async (page) => {
      await expect(page.getByTestId("paginated-table")).toBeVisible();
    }
  },
  {
    name: "editable table renders independently",
    path: "/tables/editable",
    heading: "Tables: Editable",
    assert: async (page) => {
      await expect(page.getByTestId("editable-table")).toBeVisible();
    }
  },
  {
    name: "dynamic loading renders independently",
    path: "/dynamic/loading",
    heading: "Dynamic: Loading Spinner",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Start loading" })).toBeVisible();
    }
  },
  {
    name: "dynamic content renders independently",
    path: "/dynamic/content",
    heading: "Dynamic: Content Rotation",
    assert: async (page) => {
      await expect(page.getByTestId("dynamic-content-card-0")).toBeVisible();
    }
  },
  {
    name: "dynamic delayed content renders independently",
    path: "/dynamic/delayed-content",
    heading: "Dynamic: Delayed Content",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Reveal delayed content" })).toBeVisible();
    }
  },
  {
    name: "dynamic controls renders independently",
    path: "/dynamic/controls",
    heading: "Dynamic: Enable and Disable",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Enable controls" })).toBeVisible();
    }
  },
  {
    name: "dynamic disappearing renders independently",
    path: "/dynamic/disappearing",
    heading: "Dynamic: Disappearing Elements",
    assert: async (page) => {
      await expect(page.getByTestId("disappearing-chip")).toBeVisible();
    }
  },
  {
    name: "iframe editor renders independently",
    path: "/frames/editor",
    heading: "Frames: Editor",
    assert: async (page) => {
      await expect(page.frameLocator("#editor-frame").getByText("Editable Frame")).toBeVisible();
    }
  },
  {
    name: "nested frames renders independently",
    path: "/frames/nested",
    heading: "Frames: Nested",
    assert: async (page) => {
      await expect(page.frameLocator("#nested-frame").getByText("Outer Frame")).toBeVisible();
    }
  },
  {
    name: "windows renders independently",
    path: "/windows",
    heading: "Windows",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Open new tab" })).toBeVisible();
    }
  },
  {
    name: "drag and drop renders independently",
    path: "/interactions/drag-drop",
    heading: "Interactions: Drag and Drop",
    assert: async (page) => {
      await expect(page.getByTestId("drag-token")).toBeVisible();
    }
  },
  {
    name: "hover actions renders independently",
    path: "/interactions/hover",
    heading: "Interactions: Hover Actions",
    assert: async (page) => {
      await expect(page.locator(".hover-zone")).toBeVisible();
    }
  },
  {
    name: "slider renders independently",
    path: "/interactions/slider",
    heading: "Interactions: Slider",
    assert: async (page) => {
      await expect(page.locator("#slider-control")).toBeVisible();
    }
  },
  {
    name: "menu renders independently",
    path: "/interactions/menu",
    heading: "Interactions: Multi-level Menu",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    }
  },
  {
    name: "upload renders independently",
    path: "/files/upload",
    heading: "Files: Upload",
    assert: async (page) => {
      await expect(page.getByTestId("upload-input")).toBeVisible();
    }
  },
  {
    name: "download renders independently",
    path: "/files/download",
    heading: "Files: Download",
    assert: async (page) => {
      await expect(page.getByTestId("download-text")).toBeVisible();
    }
  },
  {
    name: "secure download renders independently",
    path: "/files/secure-download",
    heading: "Files: Secure Download",
    assert: async (page) => {
      await expect(page.locator(".notice")).toContainText("locked");
    }
  },
  {
    name: "advanced locators renders independently",
    path: "/advanced-locators",
    heading: "Advanced Locators",
    assert: async (page) => {
      await expect(page.getByTestId("shadow-host")).toBeVisible();
      await expect(page.getByTestId("deep-target")).toBeVisible();
    }
  },
  {
    name: "challenging dom renders independently",
    path: "/advanced-locators/challenging-dom",
    heading: "Advanced Locators: Challenging DOM",
    assert: async (page) => {
      await expect(page.getByTestId("challenging-dom-table")).toBeVisible();
    }
  },
  {
    name: "shifting content renders independently",
    path: "/advanced-locators/shifting-content",
    heading: "Advanced Locators: Shifting Content",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Shift content" })).toBeVisible();
    }
  },
  {
    name: "basic auth renders independently",
    path: "/auth/basic",
    heading: "Auth: Basic Auth",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Authorize" })).toBeVisible();
    }
  },
  {
    name: "digest auth renders independently",
    path: "/auth/digest",
    heading: "Auth: Digest Auth",
    assert: async (page) => {
      await expect(page.getByTestId("digest-auth-form")).toBeVisible();
    }
  },
  {
    name: "session auth renders independently",
    path: "/auth/session",
    heading: "Auth: Session Login",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Start session" })).toBeVisible();
    }
  },
  {
    name: "protected page renders independently",
    path: "/auth/protected",
    heading: "Auth: Protected Page",
    assert: async (page) => {
      await expect(page.locator(".notice")).toContainText("Access denied");
    }
  },
  {
    name: "infinite scroll renders independently",
    path: "/scrolling/infinite",
    heading: "Scrolling: Infinite Scroll",
    assert: async (page) => {
      await expect(page.getByTestId("infinite-scroll-box")).toBeVisible();
    }
  },
  {
    name: "lazy images renders independently",
    path: "/scrolling/lazy-images",
    heading: "Scrolling: Lazy Images",
    assert: async (page) => {
      await expect(page.locator('[data-lazy-image="0"]')).toBeVisible();
    }
  },
  {
    name: "floating menu renders independently",
    path: "/scrolling/floating-menu",
    heading: "Scrolling: Floating Menu",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Intro" })).toBeVisible();
    }
  },
  {
    name: "api ui renders independently",
    path: "/api-ui",
    heading: "API UI",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Fetch API data" })).toBeVisible();
    }
  },
  {
    name: "delayed button renders independently",
    path: "/flaky/delayed-button",
    heading: "Flaky: Delayed Button",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Arm delayed button" })).toBeVisible();
    }
  },
  {
    name: "race condition renders independently",
    path: "/flaky/race-condition",
    heading: "Flaky: Race Condition",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Start race" })).toBeVisible();
    }
  },
  {
    name: "rerender lab renders independently",
    path: "/flaky/re-render",
    heading: "Flaky: Re-render DOM",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Re-render subtree" })).toBeVisible();
    }
  },
  {
    name: "random toast renders independently",
    path: "/flaky/random-toast",
    heading: "Flaky: Random Toast",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Show random toast" })).toBeVisible();
    }
  },
  {
    name: "typos renders independently",
    path: "/flaky/typos",
    heading: "Flaky: Typos",
    assert: async (page) => {
      await expect(page.locator(".notice")).toBeVisible();
    }
  },
  {
    name: "shop login renders independently",
    path: "/shop/login",
    heading: "Shop: Login",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Enter shop" })).toBeVisible();
    }
  },
  {
    name: "shop products renders independently",
    path: "/shop/products",
    heading: "Shop: Products",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
    }
  },
  {
    name: "shop cart renders independently",
    path: "/shop/cart",
    heading: "Shop: Cart",
    assert: async (page) => {
      await expect(page.locator(".notice")).toContainText("Cart is empty");
    }
  },
  {
    name: "shop checkout renders independently",
    path: "/shop/checkout",
    heading: "Shop: Checkout",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Place order" })).toBeDisabled();
    }
  },
  {
    name: "shop confirmation renders independently",
    path: "/shop/confirmation",
    heading: "Shop: Confirmation",
    assert: async (page) => {
      await expect(page.locator(".notice")).toContainText("No completed order yet");
    }
  },
  {
    name: "status renders independently",
    path: "/status",
    heading: "Status",
    assert: async (page) => {
      await expect(page.locator("#broken-image")).toBeVisible();
    }
  },
  {
    name: "keyboard renders independently",
    path: "/keyboard",
    heading: "Keyboard",
    assert: async (page) => {
      await expect(page.locator("#keyboard-input")).toBeVisible();
    }
  },
  {
    name: "page events renders independently",
    path: "/page-events",
    heading: "Page Events",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Notification" })).toBeVisible();
    }
  },
  {
    name: "notification messages renders independently",
    path: "/page-events/notifications",
    heading: "Page Events: Notifications",
    assert: async (page) => {
      await expect(page.getByTestId("notification-banner")).toBeVisible();
    }
  },
  {
    name: "onload error renders independently",
    path: "/page-events/onload-error",
    heading: "Page Events: Onload Error",
    assert: async (page) => {
      await expect(page.getByTestId("onload-error-card")).toBeVisible();
      await expectOutputContains(page, "Simulated onload error");
    }
  },
  {
    name: "geolocation renders independently",
    path: "/geolocation",
    heading: "Geolocation",
    assert: async (page) => {
      await expect(page.getByRole("button", { name: "Use preset" })).toBeVisible();
    }
  },
  {
    name: "coverage index renders independently",
    path: "/coverage-index",
    heading: "Coverage Index",
    assert: async (page) => {
      await expect(page.getByTestId("coverage-index-table")).toBeVisible();
    }
  }
];

for (const spec of routeSpecs) {
  test(spec.name, async ({ page }) => {
    await gotoFresh(page, spec.path, spec.heading);
    await spec.assert(page);
  });
}
