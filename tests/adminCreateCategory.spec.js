import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import { hashPassword } from '../helpers/authHelper.js';
import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

let admin;

test.describe("Create/edit/delete category functionality", () => {
    test.beforeEach(async ({ page }) => {
        await mongoose.connect(process.env.MONGO_URL);

        await mongoose.connection.createCollection('users');
        await mongoose.connection.createCollection('categories');
        await mongoose.connection.createCollection('products');

        const hashedPassword = await hashPassword("admintest");
        admin = new userModel({
            name: "admintest",
            email: "admintest" + Math.random() + "@admin.com",
            password: hashedPassword,
            phone: "12345678",
            address: "test",
            answer: "test",
            role: 1
        });

        await admin.save();

        // assuming database data has been imported and not modified, should contain this admin account
        // login as admin
        await page.goto('http://localhost:3000/login');
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(admin.email);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admintest');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // go to admin dashboard
        await page.waitForURL('http://localhost:3000');
        await expect(page.getByRole('button', { name: 'admintest' })).toBeVisible();
        await page.getByRole('button', { name: 'admintest' }).click();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        // go to admin create category
        await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();
        await page.getByRole('link', { name: 'Create Category' }).click();
        await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    });

    test.afterEach(async () => {
        await userModel.deleteOne({ email: admin.email });
        await mongoose.disconnect();
    })

    test("should create new category", async ({ page }) => {
        const categoryInput = page.getByPlaceholder("Enter new category");
        const randomNum = Math.floor(Math.random() * 100);

        await categoryInput.fill(`Test create ${randomNum}`);
        await categoryInput.press("Enter");

        // should show toast success message and added to table
        await expect(page.getByText(`Test create ${randomNum} is created`)).toBeVisible();
        await expect(page.getByRole('cell', { name: `Test create ${randomNum}`, exact: true })).toBeVisible();

        // delete new category created for testing purposes
        await mongoose.connection.collection('categories').deleteOne({ name: `Test create ${randomNum}` });
    });

    test("should show error message given empty input", async ({ page }) => {
        // submit empty input
        const categoryInput = page.getByPlaceholder("Enter new category");
        await categoryInput.fill('');
        await categoryInput.press("Enter");

        // should show toast error message
        await expect(page.getByText("Something went wrong in input form")).toBeVisible();
    });

    test("should not allow creation of duplicate category", async ({ page }) => {
        // try to submit an already existing category
        const categoryInput = page.getByPlaceholder("Enter new category");

        // manually create a category
        const randomNum = Math.floor(Math.random() * 100);

        await categoryInput.fill(`Plushie ${randomNum}`);
        await categoryInput.press("Enter");
        await expect(page.getByRole('cell', { name: `Plushie ${randomNum}`, exact: true })).toBeVisible();

        // try creation again with same category name
        await categoryInput.fill(`Plushie ${randomNum}`);
        await categoryInput.press("Enter");

        // should show toast error message and not added to table
        await expect(page.getByText("Something went wrong in input form")).toBeVisible();
        await expect(page.getByRole('cell', { name: `Plushie ${randomNum}`, exact: true })).toHaveCount(1);

        await mongoose.connection.collection('categories').deleteOne({ name: `Plushie ${randomNum}` });
    });

    test("should update category", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");
        const randomNum = Math.floor(Math.random() * 100);

        await categoryInput.fill(`Test edit ${randomNum}`);
        await categoryInput.press("Enter");

        // try edit function
        await page.getByRole('row').filter({ hasText: `Test edit ${randomNum}`, exact: true }).getByRole('button', { name: "Edit" }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill(`Test editt ${randomNum}`);
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // should show toast success message and be updated in table
        await expect(page.getByText(`Test editt ${randomNum} is updated`)).toBeVisible();
        await expect(page.getByRole('cell', { name: `Test editt ${randomNum}`, exact: true })).toBeVisible();

        // delete new category created for testing purposes
        await mongoose.connection.collection('categories').deleteOne({ name: `Test editt ${randomNum}` });
    });

    test("should not allow update if category already exists", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");
        const randomNum = Math.floor(Math.random() * 100);

        // manually create a category
        await categoryInput.fill(`Plushie ${randomNum}`);
        await categoryInput.press("Enter");
        await expect(page.getByRole('cell', { name: `Plushie ${randomNum}`, exact: true })).toBeVisible();

        // create second category
        await categoryInput.fill(`Test dup ${randomNum}`);
        await categoryInput.press("Enter");

        // try editing category name to already existing category
        await page.getByRole('row').filter({ hasText: `Test dup ${randomNum}`, exact: true }).getByRole('button', { name: "Edit" }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill(`Plushie ${randomNum}`);
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // should show toast error message and not updated in table
        await expect(page.getByText("Something went wrong")).toBeVisible();
        await expect(page.getByRole('cell', { name: `Test dup ${randomNum}`, exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: `Plushie ${randomNum}`, exact: true })).toHaveCount(1);
        await page.getByRole('button', { name: 'Close' }).click();

        // delete new category created for testing purposes
        await mongoose.connection.collection('categories').deleteOne({ name: `Test dup ${randomNum}` });
        await mongoose.connection.collection('categories').deleteOne({ name: `Plushie ${randomNum}` });
    });

    test("should delete category", async ({ page }) => {
        // manually create new category for testing
        const categoryInput = page.getByPlaceholder("Enter new category");
        const randomNum = Math.floor(Math.random() * 100);

        await categoryInput.fill(`Test del ${randomNum}`);
        await categoryInput.press("Enter");

        await page.getByRole('row').filter({ hasText: `Test del ${randomNum}`, exact: true }).getByRole('button', { name: "Delete" }).click();

        // should show toast success message and not be in table
        await expect(page.getByText("Category is deleted")).toBeVisible();
        await expect(page.getByRole('cell', { name: `Test del ${randomNum}`, exact: true })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: `Test del ${randomNum}`, exact: true })).toHaveCount(0);
    });
});