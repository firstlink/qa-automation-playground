import { test, expect } from "@playwright/test";
import { gotoAndExpect, expectOutputContains } from "./helpers.js";

test("api ui fetches data and records mutation results", async ({ page }) => {
  await gotoAndExpect(page, "/api-ui", "API UI");
  await page.getByRole("button", { name: "Fetch API data" }).click();
  await expectOutputContains(page, '"generatedAt"');
  await page.getByRole("button", { name: "Run mutation" }).click();
  await expectOutputContains(page, "approve-run");
});

test("flaky lab scenarios are automation-visible", async ({ page }) => {
  await gotoAndExpect(page, "/flaky/delayed-button", "Flaky: Delayed Button");
  await page.getByRole("button", { name: "Arm delayed button" }).click();
  const delayed = page.getByRole("button", { name: "Click when ready" });
  await expect(delayed).toBeEnabled({ timeout: 4000 });
  await delayed.click();
  await expectOutputContains(page, '"ready": true');
  await gotoAndExpect(page, "/flaky/race-condition", "Flaky: Race Condition");
  await page.getByRole("button", { name: "Start race" }).click();
  await expectOutputContains(page, '"winner"');
  await gotoAndExpect(page, "/flaky/re-render", "Flaky: Re-render DOM");
  await page.getByRole("button", { name: "Re-render subtree" }).click();
  await expectOutputContains(page, '"version": 2');
  await gotoAndExpect(page, "/flaky/random-toast", "Flaky: Random Toast");
  await page.getByRole("button", { name: "Show random toast" }).click();
  await expect(page.locator("#toast-region")).toContainText("Flaky toast");
  await gotoAndExpect(page, "/flaky/typos", "Flaky: Typos");
  await expect(page.locator(".notice")).toContainText("stable");
});

test("shop flow completes end to end", async ({ page }) => {
  await gotoAndExpect(page, "/shop/login", "Shop: Login");
  await page.getByRole("button", { name: "Enter shop" }).click();
  await expect(page.locator("#page-title")).toHaveText("Shop: Products");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("button", { name: "Add to cart" }).nth(1).click();
  await page.goto("/shop/cart");
  await expect(page.getByTestId("cart-table")).toContainText("Laptop");
  await page.goto("/shop/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.locator("#page-title")).toHaveText("Shop: Confirmation");
  await expect(page.getByTestId("confirmation-card")).toContainText("Order ID");
});
