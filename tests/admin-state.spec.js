import { test, expect } from "@playwright/test";
import { gotoFresh, expectOutputContains } from "./helpers.js";

test("admin toggles sync into shared api state and reset restores seeded defaults", async ({ page }) => {
  await gotoFresh(page, "/admin", "Admin Controls");

  await page.getByTestId("admin-flaky-mode").check();
  await page.getByTestId("admin-slow-network").check();
  await page.getByTestId("admin-dynamic-ids").check();

  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const response = await fetch("/api/state");
        const payload = await response.json();
        return payload.admin;
      })
    )
    .toMatchObject({
      stableMode: false,
      flakyMode: true,
      slowNetwork: true,
      dynamicIds: true
    });

  await page.goto("/api-ui");
  await page.getByRole("button", { name: "Fetch API data" }).click();
  await expectOutputContains(page, '"flakyMode": true');
  await expectOutputContains(page, '"slowNetwork": true');
  await expectOutputContains(page, '"dynamicIds": true');

  await page.getByTestId("global-reset-button").click();
  await expect(page.locator("#output-route-chip")).toHaveText("Reset complete");

  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const response = await fetch("/api/state");
        const payload = await response.json();
        return {
          admin: payload.admin,
          products: payload.products.length,
          notifications: payload.notifications.length
        };
      })
    )
    .toMatchObject({
      admin: {
        stableMode: true,
        flakyMode: false,
        slowNetwork: false,
        dynamicIds: false
      },
      products: 4,
      notifications: 3
    });
});
