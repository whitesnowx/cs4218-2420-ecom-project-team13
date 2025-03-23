import { test, expect } from "@playwright/test";

test.describe("User dashboard UI tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test123');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL("http://localhost:3000/");
      });
      
      test.afterEach(async ({ page }) => {
          await page.getByRole('button', { name: 'TEST' }).click();
          await page.getByText("LOGOUT").click();
          await page.getByRole('link', { name: 'LOGIN' }).waitFor();
      })
  
  test("User can navigate to profile page from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/user");

    await expect(page.getByTestId('navlink-profile')).toBeVisible();

    await page.getByTestId("navlink-profile").click();

    await expect(
      page.getByRole("heading", { name: "USER PROFILE" })
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "UPDATE" })).toBeVisible();
  });

  test("User can navigate to order page from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/user");

    await expect(page.getByTestId('navlink-orders')).toBeVisible();

    await page.getByTestId("navlink-orders").click();

    await expect(
      page.getByRole("heading", { name: "All Orders" })
    ).toBeVisible();
  });

  test("User can navigate to dashboard page from UserMenu", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");

    await page.getByRole("button", { name: "test" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByTestId('dashboard-name')).toBeVisible();
    await expect(page.getByTestId('dashboard-address')).toBeVisible();
    await expect(page.getByTestId('dashboard-email')).toBeVisible();

  });
});
