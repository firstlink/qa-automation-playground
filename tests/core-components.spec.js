import { test, expect } from "@playwright/test";
import { gotoAndExpect, expectOutputContains } from "./helpers.js";

test("admin toggles update hero badges", async ({ page }) => {
  await gotoAndExpect(page, "/admin", "Admin Controls");
  await page.getByTestId("admin-flaky-mode").check();
  await expect(page.locator("#hero-badges")).toContainText("Flaky mode");
  await page.getByTestId("admin-dynamic-ids").check();
  await expect(page.locator("#hero-badges")).toContainText("Dynamic IDs");
});

test("basic elements submit and reset update output", async ({ page }) => {
  await gotoAndExpect(page, "/basic-elements", "Basic Elements");
  await page.locator('input[name="textValue"]').fill("playwright learner");
  await page.locator('textarea[name="notesValue"]').fill("captured by e2e");
  await page.getByTestId("basic-submit").click();
  await expectOutputContains(page, "playwright learner");
  await expectOutputContains(page, "captured by e2e");
  await page.getByTestId("basic-reset").click();
  await expectOutputContains(page, "automation learner");
});

test("selection controls support delayed dropdown loading and submit", async ({ page }) => {
  await gotoAndExpect(page, "/selection-controls", "Selection Controls");
  const dynamicSelect = page.getByTestId("dynamic-dropdown");
  await expect(dynamicSelect).toBeDisabled();
  await page.getByTestId("load-dynamic-options").click();
  await expect(dynamicSelect).toBeEnabled();
  await dynamicSelect.selectOption("delayed-api");
  await page.locator('select[name="browser"]').selectOption("webkit");
  await page.getByRole("button", { name: "Submit Selection State" }).click();
  await expectOutputContains(page, "delayed-api");
  await expectOutputContains(page, "webkit");
});

test("buttons page handles click double-click long press hover and dynamic buttons", async ({ page }) => {
  await gotoAndExpect(page, "/buttons", "Buttons");
  await page.getByTestId("click-button").click();
  await expectOutputContains(page, '"clicks": 1');
  await page.getByTestId("double-click-button").dblclick();
  await expectOutputContains(page, '"count": 1');
  await page.getByTestId("long-press-button").dispatchEvent("mousedown");
  await page.waitForTimeout(800);
  await page.getByTestId("long-press-button").dispatchEvent("mouseup");
  await expectOutputContains(page, '"count": 1');
  await page.locator(".hover-zone").hover();
  await page.getByRole("button", { name: "Hidden hover action" }).click();
  await expect(page.locator("#toast-region")).toContainText("Hover action");
  await page.getByRole("button", { name: "Add element" }).click();
  await expect(page.getByRole("button", { name: "Dynamic button 3" })).toBeVisible();
  await page.getByRole("button", { name: "Dynamic button 3" }).click();
  await expectOutputContains(page, "cloneId");
});

test("dialogs support native dialogs modal nesting and toasts", async ({ page }) => {
  await page.goto("/dialogs");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("alert");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Alert" }).click();
  await expectOutputContains(page, "Automation playground alert");
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Confirm" }).click();
  await expectOutputContains(page, '"accepted": true');
  page.once("dialog", async (dialog) => {
    await dialog.accept("Spec Prompt");
  });
  await page.getByRole("button", { name: "Prompt" }).click();
  await expectOutputContains(page, "Spec Prompt");
  await page.getByRole("button", { name: "Open nested modal" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Open nested child" }).click();
  await expect(page.locator(".notice")).toContainText("Nested child modal content is visible");
  await page.getByRole("button", { name: "Close child modal" }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Toast notification" }).click();
  await expect(page.locator("#toast-region")).toContainText("Toast Demo");
});
