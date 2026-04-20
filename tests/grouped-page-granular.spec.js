import { test, expect } from "@playwright/test";
import { gotoFresh, expectOutputContains } from "./helpers.js";

test("basic elements exposes disabled and readonly fields distinctly", async ({ page }) => {
  await gotoFresh(page, "/basic-elements", "Basic Elements");
  await expect(page.getByLabel("Disabled field")).toBeDisabled();
  await expect(page.getByLabel("Readonly field")).toHaveAttribute("readonly", "");
});

test("basic elements includes a training-safe link and image", async ({ page }) => {
  await gotoFresh(page, "/basic-elements", "Basic Elements");
  await expect(page.getByTestId("basic-external-link")).toHaveAttribute("href", "https://example.com");
  await expect(page.getByAltText("Illustrated automation banner")).toBeVisible();
});

test("selection controls checkbox choices submit correctly", async ({ page }) => {
  await gotoFresh(page, "/selection-controls", "Selection Controls");
  await page.getByLabel("Frames").check();
  await page.getByRole("button", { name: "Submit Selection State" }).click();
  await expectOutputContains(page, '"frames"');
  await expectOutputContains(page, '"alerts"');
});

test("selection controls radio choice submits correctly", async ({ page }) => {
  await gotoFresh(page, "/selection-controls", "Selection Controls");
  await page.getByLabel("High").check();
  await page.getByRole("button", { name: "Submit Selection State" }).click();
  await expectOutputContains(page, '"priority": "high"');
});

test("selection controls multi-select submits all selected suites", async ({ page }) => {
  await gotoFresh(page, "/selection-controls", "Selection Controls");
  await page.locator('select[name="suites"]').selectOption(["smoke", "accessibility"]);
  await page.getByRole("button", { name: "Submit Selection State" }).click();
  await expectOutputContains(page, '"smoke"');
  await expectOutputContains(page, '"accessibility"');
});

test("buttons page context menu opens and menu action triggers toast", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  await page.getByTestId("context-zone").click({ button: "right" });
  await expect(page.locator(".custom-menu")).toBeVisible();
  await page.getByRole("button", { name: "Inspect" }).click();
  await expect(page.locator("#toast-region")).toContainText("Inspect clicked");
});

test("buttons page add and remove element controls mutate the dynamic button list", async ({ page }) => {
  await gotoFresh(page, "/buttons", "Buttons");
  const dynamicButtons = page.getByRole("button", { name: /Dynamic button/ });
  await expect(dynamicButtons).toHaveCount(2);
  await page.getByRole("button", { name: "Add element" }).click();
  await expect(dynamicButtons).toHaveCount(3);
  await page.getByRole("button", { name: "Remove element" }).click();
  await expect(dynamicButtons).toHaveCount(2);
});

test("dialogs standard modal opens and closes cleanly", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Open modal" }).click();
  await expect(page.getByRole("dialog")).toContainText("Scenario Modal");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("dialogs nested modal can open and close child overlay", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Open nested modal" }).click();
  await expect(page.getByRole("dialog")).toContainText("Nested Modal");
  await page.getByRole("button", { name: "Open nested child" }).click();
  await expect(page.getByText("Nested child modal content is visible.")).toBeVisible();
  await page.getByRole("button", { name: "Close child modal" }).click();
  await expect(page.getByText("Nested child modal content is visible.")).toHaveCount(0);
});

test("dialogs entry and exit modal variants are reachable independently", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Entry modal" }).click();
  await expect(page.getByRole("dialog")).toContainText("Entry Modal");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Exit intent modal" }).click();
  await expect(page.getByRole("dialog")).toContainText("Exit Intent Modal");
});

test("dialogs toast notification appears independently", async ({ page }) => {
  await gotoFresh(page, "/dialogs", "Dialogs");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Toast notification" }).click();
  await expect(page.locator("#toast-region")).toContainText("A notification just appeared");
});
