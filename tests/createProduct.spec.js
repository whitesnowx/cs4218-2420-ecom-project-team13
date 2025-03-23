import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from '../models/productModel'; 

dotenv.config();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));


test.beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

test.afterAll(async () => {
  await mongoose.disconnect();
});

test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@test.sg');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin@test.sg');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page.waitForURL('http://localhost:3000');
    await expect(page.getByRole('button', { name: 'ADMIN@TEST.SG' })).toBeVisible();
    await page.getByRole('button', { name: 'ADMIN@TEST.SG' }).click();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
    await page.getByRole('link', { name: 'Create Product' }).click();
    await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

});


test.describe("Create Product Test", () => {

  test.afterEach(async () => {
    await productModel.deleteMany({ name: /Wallpaper Album/i })
  });

  test("should create new product", async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Select a category$/ }).first().click();
    await page.getByTitle('Books').locator('div').click();
    
    await page.getByText('Upload Photo').click();
    await page.setInputFiles('input[type="file"]', 'tests/assets/wallpaper.jpg');
 
    const name = page.getByPlaceholder("write a name");
    await name.fill("Wallpaper Album");
    
    const description = page.getByPlaceholder("write a description");
    await description.fill("A list of wallpaper designs");

    const price = page.getByPlaceholder("write a Price");
    await price.fill("25");

    const quantity = page.getByPlaceholder("write a quantity");
    quantity.fill("100");

    await page.locator('.mb-3 > .ant-select').click();
    await page.getByText('Yes').click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    await delay(8000);

    await expect(page.getByRole('main')).toContainText('Wallpaper Album');
    await expect(page.getByRole('main')).toContainText('A list of wallpaper designs');

    await page.getByRole('link', { name: '🛒 Virtual Vault' }).click();
    
    await delay(8000);

    await page.getByRole('button', { name: 'Loadmore' }).click();

    // await delay(8000);

    await expect(page.getByText('Wallpaper Album$25.00A list').first()).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Wallpaper Album');
    await expect(page.getByRole('main')).toContainText('$25.00');
    await expect(page.getByRole('main')).toContainText('A list of wallpaper designs...');
    await expect(page.getByRole('main')).toContainText('More Details');
    await expect(page.getByRole('main')).toContainText('ADD TO CART');
  });
  

  test("should show error message if any of the fields is missing", async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Select a category$/ }).first().click();
    await page.getByTitle('Books').locator('div').click();
    
    await page.getByText('Upload Photo').click();
    await page.setInputFiles('input[type="file"]', 'tests/assets/wallpaper.jpg');
    
    const description = page.getByPlaceholder("write a description");
    await description.fill("A list of wallpaper designs");

    const price = page.getByPlaceholder("write a Price");
    await price.fill("25");

    const quantity = page.getByPlaceholder("write a quantity");
    quantity.fill("100");

    await page.locator('.mb-3 > .ant-select').click();
    await page.getByText('Yes').click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });



});

