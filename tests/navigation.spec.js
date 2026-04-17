import { test, expect } from "@playwright/test";
import { gotoAndExpect } from "./helpers.js";

const routes = [
  ["/", "Home"],
  ["/admin", "Admin Controls"],
  ["/ab-testing", "A/B Testing"],
  ["/basic-elements", "Basic Elements"],
  ["/selection-controls", "Selection Controls"],
  ["/buttons", "Buttons"],
  ["/dialogs", "Dialogs"],
  ["/forms/login", "Forms: Login"],
  ["/forms/register", "Forms: Register"],
  ["/forms/forgot-password", "Forms: Forgot Password"],
  ["/tables/static", "Tables: Static"],
  ["/tables/sortable", "Tables: Sortable"],
  ["/tables/paginated", "Tables: Paginated"],
  ["/tables/editable", "Tables: Editable"],
  ["/dynamic/loading", "Dynamic: Loading Spinner"],
  ["/dynamic/content", "Dynamic: Content Rotation"],
  ["/dynamic/delayed-content", "Dynamic: Delayed Content"],
  ["/dynamic/controls", "Dynamic: Enable and Disable"],
  ["/dynamic/disappearing", "Dynamic: Disappearing Elements"],
  ["/frames/editor", "Frames: Editor"],
  ["/frames/nested", "Frames: Nested"],
  ["/windows", "Windows"],
  ["/interactions/drag-drop", "Interactions: Drag and Drop"],
  ["/interactions/hover", "Interactions: Hover Actions"],
  ["/interactions/slider", "Interactions: Slider"],
  ["/interactions/menu", "Interactions: Multi-level Menu"],
  ["/files/upload", "Files: Upload"],
  ["/files/download", "Files: Download"],
  ["/files/secure-download", "Files: Secure Download"],
  ["/advanced-locators", "Advanced Locators"],
  ["/advanced-locators/challenging-dom", "Advanced Locators: Challenging DOM"],
  ["/advanced-locators/shifting-content", "Advanced Locators: Shifting Content"],
  ["/auth/basic", "Auth: Basic Auth"],
  ["/auth/digest", "Auth: Digest Auth"],
  ["/auth/session", "Auth: Session Login"],
  ["/auth/protected", "Auth: Protected Page"],
  ["/scrolling/infinite", "Scrolling: Infinite Scroll"],
  ["/scrolling/lazy-images", "Scrolling: Lazy Images"],
  ["/scrolling/floating-menu", "Scrolling: Floating Menu"],
  ["/api-ui", "API UI"],
  ["/flaky/delayed-button", "Flaky: Delayed Button"],
  ["/flaky/race-condition", "Flaky: Race Condition"],
  ["/flaky/re-render", "Flaky: Re-render DOM"],
  ["/flaky/random-toast", "Flaky: Random Toast"],
  ["/flaky/typos", "Flaky: Typos"],
  ["/shop/login", "Shop: Login"],
  ["/shop/products", "Shop: Products"],
  ["/shop/cart", "Shop: Cart"],
  ["/shop/checkout", "Shop: Checkout"],
  ["/shop/confirmation", "Shop: Confirmation"],
  ["/status", "Status"],
  ["/keyboard", "Keyboard"],
  ["/page-events", "Page Events"],
  ["/page-events/notifications", "Page Events: Notifications"],
  ["/page-events/onload-error", "Page Events: Onload Error"],
  ["/geolocation", "Geolocation"],
  ["/coverage-index", "Coverage Index"]
];

test("all key routes render their page shell", async ({ page }) => {
  for (const [path, heading] of routes) {
    await gotoAndExpect(page, path, heading);
  }
});

test("sidebar navigation reaches major destination pages", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("nav--admin").click();
  await expect(page.locator("#page-title")).toHaveText("Admin Controls");
  await page.getByTestId("nav--basic-elements").click();
  await expect(page.locator("#page-title")).toHaveText("Basic Elements");
  await page.getByTestId("nav--api-ui").click();
  await expect(page.locator("#page-title")).toHaveText("API UI");
  await page.getByTestId("top-coverage-link").click();
  await expect(page.locator("#page-title")).toHaveText("Coverage Index");
});
