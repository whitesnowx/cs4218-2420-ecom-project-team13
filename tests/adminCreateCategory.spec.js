// @ts-check
import { test, expect } from '@playwright/test';

// before each test, login as admin and redirect to admin create category page
test.beforeEach(async ({ page }) => {
    // assuming database data has been imported and not modified, should contain this admin account
    // login as admin
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@admin.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // go to admin dashboard
    await page.waitForURL('http://localhost:3000');
    await expect(page.getByRole('button', { name: 'MyAdmin' })).toBeVisible();
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // go to admin create category
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();

    // assuming database data has been imported, page should be rendered with 3 existing categories
    // "Electronics", "Books", "Clothing"
});

test.describe("Create category functionality", () => {
    test("should create new category", async ({ page }) => {
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.fill("Test create");
        await categoryInput.press("Enter");

        // should show toast success message and added to table
        await expect(page.getByText("Test create is created")).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Test create' })).toBeVisible();

        // delete new category created for testing purposes
        await page.getByRole('row').filter({ hasText: 'Test create' }).getByRole('button', { name: "Delete" }).click();
        await expect(page.getByRole('cell', { name: 'Test create' })).not.toBeVisible();
    });

    test("should show error message given empty input", async ({ page }) => {
        // submit empty input
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.press("Enter");

        // should show toast error message
        await expect(page.getByText("Something went wrong in input form")).toBeVisible();
    });

    test("should not allow creation of duplicate category", async ({ page }) => {
        // try to submit an already existing category
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.fill("Electronics");
        await categoryInput.press("Enter");

        // should show toast error message and not added to table
        await expect(page.getByText("Something went wrong in input form")).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Electronics' })).toHaveCount(1);
    });
    
});

test.describe("Edit category functionality", () => {
    test("should update category", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.fill("Test edit");
        await categoryInput.press("Enter");

        // try edit function
        await page.getByRole('row').filter({ hasText: 'Test edit' }).getByRole('button', { name: "Edit" }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Test editt');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // should show toast success message and be updated in table
        await expect(page.getByText("Test editt is updated")).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Test editt' })).toBeVisible();

        // delete new category created for testing purposes
        await page.getByRole('row').filter({ hasText: 'Test editt' }).getByRole('button', { name: "Delete" }).click();
        await expect(page.getByRole('cell', { name: 'Test editt' })).not.toBeVisible();
    });

    test("should not allow update if category already exists", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.fill("Test dup");
        await categoryInput.press("Enter");

        // try editing category name to already existing category
        await page.getByRole('row').filter({ hasText: 'Test dup' }).getByRole('button', { name: "Edit" }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Electronics');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        
        // should show toast error message and not updated in table
        await expect(page.getByText("Something went wrong")).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Electronics' })).toHaveCount(1);
        await page.getByRole('button', { name: 'Close' }).click();

        // delete new category created for testing purposes
        await page.getByRole('row').filter({ hasText: 'Test dup' }).getByRole('button', { name: "Delete" }).click();
        await expect(page.getByRole('cell', { name: 'Test dup' })).not.toBeVisible();
    });
});

test.describe("Delete category functionality", () => {
    test("should delete category", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");

        await categoryInput.fill("Test del");
        await categoryInput.press("Enter");

        await page.getByRole('row').filter({ hasText: 'Test del' }).getByRole('button', { name: "Delete" }).click();

        // should show toast success message and not be in table
        await expect(page.getByText("Category is deleted")).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Test del' })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'Test del' })).toHaveCount(0);
    });
});