import { test, expect } from "@playwright/test";

test.describe("Admin dashboard UI tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('abc@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('abc');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL("http://localhost:3000/");
      });
      
      test.afterEach(async ({ page }) => {
          await page.getByRole('button', { name: 'abc' }).click();
          await page.getByText("LOGOUT").click();
          await page.getByRole('link', { name: 'LOGIN' }).waitFor();
      })
  
  test("Admin can navigate to Create Category from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/admin");
    await page.waitForURL("http://localhost:3000/dashboard/admin");
    await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();

    await page.getByRole('link', { name: 'Create Category' }).click();

    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
  });

  test("Admin can navigate to Create Product from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/admin");
    await page.waitForURL("http://localhost:3000/dashboard/admin");
    await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
    await page.getByRole('link', { name: 'Create Product' }).click();

    await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'CREATE PRODUCT' })).toBeVisible();
    await expect(page.getByText('Upload Photo')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'write a name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'write a description' })).toBeVisible();
    await expect(page.getByPlaceholder('write a Price')).toBeVisible();
    await expect(page.getByPlaceholder('write a quantity')).toBeVisible();
  });

  test("Admin can navigate to Products from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/admin");
    await page.waitForURL("http://localhost:3000/dashboard/admin");
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
  });

  test("Admin can navigate to Orders from dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/admin");
    await page.waitForURL("http://localhost:3000/dashboard/admin");
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  });


  test("Admin can navigate to dashboard page from AdminMenu", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");
    await page.waitForURL("http://localhost:3000");
    await page.getByRole('button', { name: 'abc' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Name : abc' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Email : abc@gmail.com' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Contact :' })).toBeVisible();
  });
});
