import { expect } from "@playwright/test";

export async function gotoAndExpect(page, path, heading) {
  await page.goto(path);
  await expect(page.locator("#page-title")).toHaveText(heading);
  await expect(page.locator("#component-area")).toBeVisible();
  await expect(page.locator("#output-content")).toBeVisible();
}

export async function expectOutputContains(page, text) {
  await expect(page.locator("#output-content")).toContainText(text);
}

export async function resetApp(page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByTestId("global-reset-button").click();
  await expect(page.locator("#output-route-chip")).toHaveText("Reset complete");
}

export async function gotoFresh(page, path, heading) {
  await resetApp(page);
  await gotoAndExpect(page, path, heading);
}
