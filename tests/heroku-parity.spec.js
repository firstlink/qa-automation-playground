import { test, expect } from "@playwright/test";
import { gotoAndExpect, expectOutputContains } from "./helpers.js";

test("new Heroku-parity components behave as expected", async ({ page }) => {
  await gotoAndExpect(page, "/ab-testing", "A/B Testing");
  await expect(page.getByTestId("ab-testing-card")).toContainText("Assigned variant");
  await page.getByRole("button", { name: "Rebucket Visitor" }).click();
  await expectOutputContains(page, '"variant":');

  await gotoAndExpect(page, "/dynamic/content", "Dynamic: Content Rotation");
  await expect(page.getByTestId("dynamic-content-card-0")).toBeVisible();
  await page.getByRole("button", { name: "Refresh Dynamic Content" }).click();
  await expectOutputContains(page, '"version": 2');

  await gotoAndExpect(page, "/advanced-locators/challenging-dom", "Advanced Locators: Challenging DOM");
  await page.getByRole("button", { name: "edit" }).first().click();
  await expectOutputContains(page, '"mode": "edit"');

  await gotoAndExpect(page, "/advanced-locators/shifting-content", "Advanced Locators: Shifting Content");
  await page.getByRole("button", { name: "Shift content" }).click();
  await expectOutputContains(page, '"shifted": true');

  await gotoAndExpect(page, "/auth/digest", "Auth: Digest Auth");
  await page.getByRole("button", { name: "Authorize digest request" }).click();
  await expectOutputContains(page, '"granted": true');

  await gotoAndExpect(page, "/files/secure-download", "Files: Secure Download");
  await expect(page.locator(".notice")).toContainText("unlocked");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Secure Report" }).click()
  ]);
  expect(await download.suggestedFilename()).toBe("secure-report.txt");

  await gotoAndExpect(page, "/page-events/notifications", "Page Events: Notifications");
  await expect(page.getByTestId("notification-banner")).toBeVisible();
  await page.getByRole("button", { name: "Click here" }).click();
  await expectOutputContains(page, '"index": 1');

  await gotoAndExpect(page, "/page-events/onload-error", "Page Events: Onload Error");
  await expect(page.getByTestId("onload-error-card")).toContainText("captured");
  await expectOutputContains(page, "Simulated onload error");
});
