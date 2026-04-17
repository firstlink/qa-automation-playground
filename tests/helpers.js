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
