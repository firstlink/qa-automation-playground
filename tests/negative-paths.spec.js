import { test, expect } from "@playwright/test";
import { gotoFresh, expectOutputContains } from "./helpers.js";

test("login failure stays on login route and reports failure", async ({ page }) => {
  await gotoFresh(page, "/forms/login", "Forms: Login");
  await page.locator('input[name="username"]').fill("wrong-user");
  await page.locator('input[name="password"]').fill("wrong-pass");
  await page.getByRole("button", { name: "Log in" }).click();
  await expectOutputContains(page, '"success": false');
  await expect(page.locator("#page-title")).toHaveText("Forms: Login");
});

test("register rejects mismatched passwords", async ({ page }) => {
  await gotoFresh(page, "/forms/register", "Forms: Register");
  await page.locator('input[name="username"]').fill("negative-user");
  await page.locator('input[name="email"]').fill("negative@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.locator('input[name="confirmPassword"]').fill("Password123!x");
  await page.getByRole("button", { name: "Create account" }).click();
  await expectOutputContains(page, '"valid": false');
  await expectOutputContains(page, '"passwordsMatch": false');
});

test("basic auth rejects invalid credentials", async ({ page }) => {
  await gotoFresh(page, "/auth/basic", "Auth: Basic Auth");
  await page.locator('input[name="username"]').fill("bad");
  await page.locator('input[name="password"]').fill("creds");
  await page.getByRole("button", { name: "Authorize" }).click();
  await expectOutputContains(page, '"granted": false');
});

test("digest auth rejects invalid credentials", async ({ page }) => {
  await gotoFresh(page, "/auth/digest", "Auth: Digest Auth");
  await page.locator('input[name="username"]').fill("bad");
  await page.locator('input[name="password"]').fill("creds");
  await page.getByRole("button", { name: "Authorize digest request" }).click();
  await expectOutputContains(page, '"granted": false');
});

test("protected page denies access without session", async ({ page }) => {
  await gotoFresh(page, "/auth/protected", "Auth: Protected Page");
  await expect(page.locator(".notice")).toContainText("Access denied");
});

test("secure download remains locked without auth", async ({ page }) => {
  await gotoFresh(page, "/files/secure-download", "Files: Secure Download");
  await expect(page.locator(".notice")).toContainText("locked");
  await expect(page.getByRole("link", { name: "Secure Report" })).toHaveCount(0);
});

test("api ui error action reports error state", async ({ page }) => {
  await gotoFresh(page, "/api-ui", "API UI");
  await page.getByRole("button", { name: "Fetch error state" }).click();
  await expectOutputContains(page, "Simulated server error");
});

test("shop login rejects invalid credentials", async ({ page }) => {
  await gotoFresh(page, "/shop/login", "Shop: Login");
  await page.locator('input[name="username"]').fill("bad-shop-user");
  await page.locator('input[name="password"]').fill("bad-shop-pass");
  await page.getByRole("button", { name: "Enter shop" }).click();
  await expect(page.locator("#page-title")).toHaveText("Shop: Login");
  await expect(page.locator("#toast-region")).toContainText("Invalid shop credentials");
});

test("shop checkout is blocked with empty cart", async ({ page }) => {
  await gotoFresh(page, "/shop/checkout", "Shop: Checkout");
  await expect(page.getByRole("button", { name: "Place order" })).toBeDisabled();
});

test("status 500 action reports server error", async ({ page }) => {
  await gotoFresh(page, "/status", "Status");
  await page.getByRole("button", { name: "500" }).click();
  await expectOutputContains(page, '"status": 500');
});
