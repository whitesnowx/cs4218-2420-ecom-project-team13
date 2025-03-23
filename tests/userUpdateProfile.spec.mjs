import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { hashPassword } from '../helpers/authHelper.js';

dotenv.config();

let user; 

test.describe('Update Profile UI tests', () => {
  test.beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    await mongoose.connection.createCollection('users');
    
    const hashedPassword = await hashPassword("testUser");
    user = new userModel({
      name: "testUserProfile", 
      email: "testUserProfile" + Math.random() + "@gmail.com",  //to handle multiple workers at once
      password: hashedPassword,
      phone: "12345678", 
      address: "Blk 123 Mochi Street", 
      answer: "ball", 
      role: 0
    });

    await user.save();
  })

  test.afterEach(async () => {
    await userModel.deleteOne({ email: user.email});
    await mongoose.disconnect();
  })

  test("update profile", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForURL("http://localhost:3000/");
    await page.getByText("LOGIN").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill("testUser");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000/");

    
    await page.getByRole("button", { name: "testUserProfile" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByTestId("navlink-profile").click();

    await page.getByPlaceholder("Enter Your Name").fill("testUser1");
    await page.getByPlaceholder("Enter Your Password").fill("testUser1");
    await page.getByPlaceholder("Enter Your Phone").fill("87654321");
    await page.getByPlaceholder("Enter Your Address").fill("Blk 123 Bread Street");

    await page.getByRole("button", { name: "UPDATE" }).click();

    expect(await page.locator('input[placeholder="Enter Your Name"]').inputValue()).toBe("testUser1");
    expect(await page.locator('input[placeholder="Enter Your Phone"]').inputValue()).toBe("87654321");
    expect(await page.locator('input[placeholder="Enter Your Address"]').inputValue()).toBe("Blk 123 Bread Street");

  
    await page.getByRole('button', { name: 'testUser1' }).click();
    await page.getByText("LOGOUT").click();
    await page.waitForURL("http://localhost:3000/login");
    await page.getByRole('link', { name: 'LOGIN' }).waitFor();
  })

  test.fail("update profile with password less than 6 characters", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForURL("http://localhost:3000/");
    await page.getByText("LOGIN").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill("testUser");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000/");

    
    await page.getByRole("button", { name: "testUserProfile" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByTestId("navlink-profile").click();

    await page.getByPlaceholder("Enter Your Password").fill("123");
    await page.getByRole("button", { name: "UPDATE" }).click();

    await expect(page.getByText("Passsword is required and 6 character long")).toBeVisible();

    await page.getByRole('button', { name: 'testUser1' }).click();
    await page.getByText("LOGOUT").click();
    await page.waitForURL("http://localhost:3000/login");
    await page.getByRole('link', { name: 'LOGIN' }).waitFor();
  })
})
