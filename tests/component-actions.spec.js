import { test, expect } from "@playwright/test";
import { gotoFresh, expectOutputContains } from "./helpers.js";

test("admin flaky toggle updates hero badges in isolation", async ({ page }) => {
  await gotoFresh(page, "/admin", "Admin Controls");
  await page.getByTestId("admin-flaky-mode").check();
  await expect(page.locator("#hero-badges")).toContainText("Flaky mode");
});

test("admin dynamic ids toggle updates hero badges in isolation", async ({ page }) => {
  await gotoFresh(page, "/admin", "Admin Controls");
  await page.getByTestId("admin-dynamic-ids").check();
  await expect(page.locator("#hero-badges")).toContainText("Dynamic IDs");
});

test("basic elements submit works in isolation", async ({ page }) => {
  await gotoFresh(page, "/basic-elements", "Basic Elements");
  await page.locator('input[name="textValue"]').fill("isolated submit");
  await page.getByTestId("basic-submit").click();
  await expectOutputContains(page, "isolated submit");
});

test("basic elements reset works in isolation", async ({ page }) => {
  await gotoFresh(page, "/basic-elements", "Basic Elements");
  await page.locator('input[name="textValue"]').fill("changed value");
  await page.getByTestId("basic-reset").click();
  await expectOutputContains(page, "automation learner");
});

test("selection controls dynamic dropdown loading works in isolation", async ({ page }) => {
  await gotoFresh(page, "/selection-controls", "Selection Controls");
  await expect(page.getByTestId("dynamic-dropdown")).toBeDisabled();
  await page.getByTestId("load-dynamic-options").click();
  await expect(page.getByTestId("dynamic-dropdown")).toBeEnabled();
});

test("selection controls submit works in isolation", async ({ page }) => {
  await gotoFresh(page, "/selection-controls", "Selection Controls");
  await page.getByTestId("load-dynamic-options").click();
  await page.getByTestId("dynamic-dropdown").selectOption("delayed-shop");
  await page.getByRole("button", { name: "Submit Selection State" }).click();
  await expectOutputContains(page, "delayed-shop");
});

test("click button works in isolation", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  await page.getByTestId("click-button").click();
  await expectOutputContains(page, '"clicks": 1');
});

test("double click button works in isolation", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  await page.getByTestId("double-click-button").dblclick();
  await expectOutputContains(page, '"count": 1');
});

test("long press button works in isolation", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  await page.getByTestId("long-press-button").dispatchEvent("mousedown");
  await page.waitForTimeout(800);
  await page.getByTestId("long-press-button").dispatchEvent("mouseup");
  await expectOutputContains(page, '"count": 1');
});

test("hover reveal works in isolation", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  await page.locator(".hover-zone").hover();
  await page.getByRole("button", { name: "Hidden hover action" }).click();
  await expect(page.locator("#toast-region")).toContainText("Hover action");
});

test("alert dialog works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Alert" }).click();
  await expectOutputContains(page, "Automation playground alert");
});

test("confirm dialog works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Confirm" }).click();
  await expectOutputContains(page, '"accepted": true');
});

test("prompt dialog works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  page.once("dialog", async (dialog) => {
    await dialog.accept("Atomic Prompt");
  });
  await page.getByRole("button", { name: "Prompt" }).click();
  await expectOutputContains(page, "Atomic Prompt");
});

test("login success works in isolation", async ({ page }) => {
  await gotoFresh(page, "/forms/login", "Forms: Login");
  await page.getByRole("button", { name: "Log in" }).click();
  await expectOutputContains(page, '"success": true');
});

test("register success works in isolation", async ({ page }) => {
  await gotoFresh(page, "/forms/register", "Forms: Register");
  await page.locator('input[name="username"]').fill("isolated-user");
  await page.locator('input[name="email"]').fill("isolated@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.locator('input[name="confirmPassword"]').fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expectOutputContains(page, '"valid": true');
});

test("forgot password submit works in isolation", async ({ page }) => {
  await gotoFresh(page, "/forms/forgot-password", "Forms: Forgot Password");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expectOutputContains(page, "student@example.com");
});

test("sortable table sort action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/tables/sortable", "Tables: Sortable");
  await page.getByRole("button", { name: "Duration" }).click();
  await expect(page.getByTestId("sortable-table").locator("tbody tr").first()).toContainText("15s");
});

test("paginated table next page action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/tables/paginated", "Tables: Paginated");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByTestId("paginated-table")).toContainText("6");
});

test("editable table save action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/tables/editable", "Tables: Editable");
  await page.locator('input[name="quantity-1"]').fill("12");
  await page.getByRole("button", { name: "Save table" }).click();
  await expectOutputContains(page, '"quantity": 12');
});

test("dynamic loading action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dynamic/loading", "Dynamic: Loading Spinner");
  await page.getByRole("button", { name: "Start loading" }).click();
  await expect(page.locator("#spinner-result")).toContainText("Loaded", { timeout: 3000 });
});

test("dynamic delayed content action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dynamic/delayed-content", "Dynamic: Delayed Content");
  await page.getByRole("button", { name: "Reveal delayed content" }).click();
  await expect(page.locator("#delayed-content-panel")).toContainText("now visible", { timeout: 3000 });
});

test("dynamic controls toggle works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dynamic/controls", "Dynamic: Enable and Disable");
  await page.getByRole("button", { name: "Enable controls" }).click();
  await expect(page.locator('input[value="toggle me"]')).toBeEnabled();
});

test("disappearing element action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/dynamic/disappearing", "Dynamic: Disappearing Elements");
  await page.getByRole("button", { name: "Arm disappearance" }).click();
  await expect(page.getByTestId("disappearing-chip")).toBeHidden({ timeout: 3000 });
});

test("drag and drop action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/interactions/drag-drop", "Interactions: Drag and Drop");
  await page.locator("#drag-token").dragTo(page.locator("#drop-target"));
  await expectOutputContains(page, "drag-token");
});

test("slider action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/interactions/slider", "Interactions: Slider");
  await page.locator("#slider-control").fill("82");
  await expect(page.locator("#slider-value")).toHaveText("82");
});

test("menu action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/interactions/menu", "Interactions: Multi-level Menu");
  await page.getByRole("button", { name: "Reports" }).click();
  await expectOutputContains(page, "Reports");
});

test("upload action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/files/upload", "Files: Upload");
  await page.getByTestId("upload-input").setInputFiles({
    name: "isolation.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("isolation")
  });
  await expectOutputContains(page, "isolation.txt");
});

test("download action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/files/download", "Files: Download");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("download-text").click()
  ]);
  expect(await download.suggestedFilename()).toBe("sample-report.txt");
});

test("digest auth action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/auth/digest", "Auth: Digest Auth");
  await page.getByRole("button", { name: "Authorize digest request" }).click();
  await expectOutputContains(page, '"granted": true');
});

test("session auth action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/auth/session", "Auth: Session Login");
  await page.getByRole("button", { name: "Start session" }).click();
  await expectOutputContains(page, '"loggedIn": true');
});

test("infinite scroll load more action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/scrolling/infinite", "Scrolling: Infinite Scroll");
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByTestId("infinite-scroll-box")).toContainText("Feed item 16");
});

test("api fetch action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/api-ui", "API UI");
  await page.getByRole("button", { name: "Fetch API data" }).click();
  await expectOutputContains(page, '"generatedAt"');
});

test("shop login action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/shop/login", "Shop: Login");
  await page.getByRole("button", { name: "Enter shop" }).click();
  await expect(page.locator("#page-title")).toHaveText("Shop: Products");
});

test("status 404 action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/status", "Status");
  await page.getByRole("button", { name: "404" }).click();
  await expectOutputContains(page, '"status": 404');
});

test("keyboard input action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/keyboard", "Keyboard");
  await page.locator("#keyboard-input").pressSequentially("xyz");
  await expectOutputContains(page, "xyz");
});

test("notification message reroll works in isolation", async ({ page }) => {
  await gotoFresh(page, "/page-events/notifications", "Page Events: Notifications");
  await page.getByRole("button", { name: "Click here" }).click();
  await expectOutputContains(page, '"index": 1');
});

test("geolocation preset action works in isolation", async ({ page }) => {
  await gotoFresh(page, "/geolocation", "Geolocation");
  await page.getByRole("button", { name: "Use preset" }).click();
  await expectOutputContains(page, '"latitude": 40.7128');
});
