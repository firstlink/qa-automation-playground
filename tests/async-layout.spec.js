import { test, expect } from "@playwright/test";
import { gotoAndExpect, expectOutputContains } from "./helpers.js";

test("dynamic scenarios cover loading delayed content controls and disappearing elements", async ({ page }) => {
  await gotoAndExpect(page, "/dynamic/loading", "Dynamic: Loading Spinner");
  await page.getByRole("button", { name: "Start loading" }).click();
  await expectOutputContains(page, "delayMs");
  await expect(page.locator("#spinner-result")).toContainText("Loaded", { timeout: 3000 });
  await gotoAndExpect(page, "/dynamic/delayed-content", "Dynamic: Delayed Content");
  await page.getByRole("button", { name: "Reveal delayed content" }).click();
  await expect(page.locator("#delayed-content-panel")).toContainText("now visible", { timeout: 3000 });
  await gotoAndExpect(page, "/dynamic/controls", "Dynamic: Enable and Disable");
  await page.getByRole("button", { name: "Enable controls" }).click();
  await expect(page.locator('input[value="toggle me"]')).toBeEnabled();
  await gotoAndExpect(page, "/dynamic/disappearing", "Dynamic: Disappearing Elements");
  await page.getByRole("button", { name: "Arm disappearance" }).click();
  await expect(page.getByTestId("disappearing-chip")).toBeHidden({ timeout: 3000 });
});

test("frames windows and interactions work", async ({ page, context }) => {
  await gotoAndExpect(page, "/frames/editor", "Frames: Editor");
  const frame = page.frameLocator("#editor-frame");
  await expect(frame.getByText("Editable Frame")).toBeVisible();
  await frame.locator('[contenteditable="true"]').fill("Updated inside frame");
  await gotoAndExpect(page, "/frames/nested", "Frames: Nested");
  const outer = page.frameLocator("#nested-frame");
  await expect(outer.getByText("Outer Frame")).toBeVisible();
  await expect(outer.frameLocator('iframe[title="Inner nested frame"]').getByText("Inner Frame")).toBeVisible();
  await gotoAndExpect(page, "/windows", "Windows");
  const [newTab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Open new tab" }).click()
  ]);
  await newTab.waitForLoadState();
  await expect(newTab.locator("#page-title")).toHaveText("Page Events");
  await newTab.close();
  await page.getByRole("button", { name: "Trigger redirect" }).click();
  await expect(page).toHaveURL(/redirected=1/);
  await gotoAndExpect(page, "/interactions/drag-drop", "Interactions: Drag and Drop");
  await expect(page.getByTestId("drag-token")).toBeVisible();
  await expect(page.getByTestId("drop-target")).toContainText("Drop target");
  await gotoAndExpect(page, "/interactions/slider", "Interactions: Slider");
  await page.locator("#slider-control").fill("75");
  await expect(page.locator("#slider-value")).toHaveText("75");
  await gotoAndExpect(page, "/interactions/menu", "Interactions: Multi-level Menu");
  await page.getByRole("button", { name: "Reports" }).click();
  await expectOutputContains(page, "Reports");
});

test("files locators scrolling status keyboard page-events geolocation and coverage are usable", async ({ page }) => {
  await gotoAndExpect(page, "/files/upload", "Files: Upload");
  await page.getByTestId("upload-input").setInputFiles({
    name: "demo.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello")
  });
  await expectOutputContains(page, "demo.txt");
  await gotoAndExpect(page, "/files/download", "Files: Download");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("download-text").click()
  ]);
  expect(await download.suggestedFilename()).toBe("sample-report.txt");
  await gotoAndExpect(page, "/advanced-locators", "Advanced Locators");
  await expect(page.getByTestId("deep-target")).toBeVisible();
  await expect(page.getByTestId("shadow-host")).toBeVisible();
  await gotoAndExpect(page, "/scrolling/infinite", "Scrolling: Infinite Scroll");
  const scrollBox = page.getByTestId("infinite-scroll-box");
  await expect(scrollBox).toContainText("Feed item 12");
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(scrollBox).toContainText("Feed item 16");
  await gotoAndExpect(page, "/scrolling/lazy-images", "Scrolling: Lazy Images");
  await expect(page.locator('[data-lazy-image="0"]')).toHaveAttribute("src", /data:image\/svg\+xml/);
  await gotoAndExpect(page, "/scrolling/floating-menu", "Scrolling: Floating Menu");
  await page.getByRole("button", { name: "Selectors" }).click();
  await expect(page.locator("#menu-b")).toBeVisible();
  await gotoAndExpect(page, "/status", "Status");
  await page.getByRole("button", { name: "404" }).click();
  await expectOutputContains(page, '"status": 404');
  await expect(page.locator("#broken-image-status")).toContainText("Broken image detected");
  await gotoAndExpect(page, "/keyboard", "Keyboard");
  await page.locator("#keyboard-input").pressSequentially("abc");
  await expectOutputContains(page, "abc");
  await gotoAndExpect(page, "/page-events", "Page Events");
  await page.getByRole("button", { name: "Notification" }).click();
  await expect(page.locator("#toast-region")).toContainText("Page event");
  await gotoAndExpect(page, "/geolocation", "Geolocation");
  await page.getByRole("button", { name: "Use preset" }).click();
  await expectOutputContains(page, '"latitude": 40.7128');
  await gotoAndExpect(page, "/coverage-index", "Coverage Index");
  await expect(page.getByTestId("coverage-index-table")).toContainText("/selection-controls");
});
