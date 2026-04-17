import { test, expect } from "@playwright/test";
import { gotoAndExpect, expectOutputContains } from "./helpers.js";

test("login register and forgot-password flows work", async ({ page }) => {
  await gotoAndExpect(page, "/forms/login", "Forms: Login");
  await page.getByRole("button", { name: "Log in" }).click();
  await expectOutputContains(page, '"success": true');
  await gotoAndExpect(page, "/forms/register", "Forms: Register");
  await page.locator('input[name="username"]').fill("newstudent");
  await page.locator('input[name="email"]').fill("newstudent@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.locator('input[name="confirmPassword"]').fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expectOutputContains(page, '"valid": true');
  await gotoAndExpect(page, "/forms/forgot-password", "Forms: Forgot Password");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expectOutputContains(page, "student@example.com");
});

test("tables support static sort pagination and editing", async ({ page }) => {
  await gotoAndExpect(page, "/tables/static", "Tables: Static");
  await expect(page.getByTestId("static-table")).toContainText("Laptop");
  await gotoAndExpect(page, "/tables/sortable", "Tables: Sortable");
  await page.getByRole("button", { name: "Duration" }).click();
  await expect(page.getByTestId("sortable-table").locator("tbody tr").first()).toContainText("15s");
  await gotoAndExpect(page, "/tables/paginated", "Tables: Paginated");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByTestId("paginated-table")).toContainText("6");
  await gotoAndExpect(page, "/tables/editable", "Tables: Editable");
  await page.locator('input[name="quantity-1"]').fill("9");
  await page.getByRole("button", { name: "Save table" }).click();
  await expectOutputContains(page, '"quantity": 9');
});

test("auth scenarios gate access correctly", async ({ page }) => {
  await gotoAndExpect(page, "/auth/basic", "Auth: Basic Auth");
  await page.getByRole("button", { name: "Authorize" }).click();
  await expectOutputContains(page, '"granted": true');
  await gotoAndExpect(page, "/auth/protected", "Auth: Protected Page");
  await expect(page.locator(".notice")).toContainText("Access denied");
  await gotoAndExpect(page, "/auth/session", "Auth: Session Login");
  await page.getByRole("button", { name: "Start session" }).click();
  await expectOutputContains(page, '"loggedIn": true');
  await gotoAndExpect(page, "/auth/protected", "Auth: Protected Page");
  await expect(page.locator(".notice")).toContainText("Protected content unlocked");
});
