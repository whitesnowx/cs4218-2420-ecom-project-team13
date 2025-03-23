import { test, expect } from "@playwright/test";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { hashPassword } from '../helpers/authHelper.js';

dotenv.config({ path: ".env" });

function generateRandomEmail() {
    let email = "bob" + Math.random() + "@gmail.com";

    return email;
}

const user = {
    name: "Bob",
    email: generateRandomEmail(),
    password: "bobthebuilder",
    phone: "98765423",
    address: "123 Street",
    answer: "Soccer"
}

const user2 = {
    name: "Bob2",
    email: generateRandomEmail(),
    password: "bob2thebuilder",
    phone: "87645124",
    address: "321 Street",
    answer: "Basketball"
}

test.describe("Login page", () => {

    test.beforeEach(async ({ page }) => {
        await mongoose.connect(process.env.MONGO_URL);
        await mongoose.connection.createCollection("users");

        const hashedPassword = await hashPassword(user.password);
        const createdUser = new userModel({
            name: user.name,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            address: user.address,
            answer: user.answer,
            role: 0
        });

        await createdUser.save();

        await page.goto('http://localhost:3000/');
        await page.waitForURL("http://localhost:3000/");
    });

    test.afterEach(async () => {
        await userModel.deleteOne({ email: user.email });
        await mongoose.disconnect();
    });

    test("should login user successfully", async ({ page }) => {
        // Go to Login Page
        await page.getByRole('link', { name: 'Login' }).click();
        await page.waitForURL("http://localhost:3000/login");

        // Make sure page is now Login page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user.password);

        // Login user
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await expect(
            page.getByText("Login Successfully")
        ).toBeVisible();

        // Wait for URL to change to Home page
        await page.waitForURL("http://localhost:3000/", { timeout: 40000 });

        // Check if user has been moved to the correct location
        await expect(page).toHaveURL("http://localhost:3000/");
        await expect(page.getByRole('button', { name: user.name })).toBeVisible();
        await expect(page.getByRole('list')).toContainText(user.name);
    });

    test("should prompt user that email is not registered", async ({ page }) => {
        // Go to Login Page
        await page.getByRole('link', { name: 'Login' }).click();
        await page.waitForURL("http://localhost:3000/login");

        // Make sure page is now Login page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user2.email);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user2.password);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user2.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user2.password);

        // Login user
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await expect(
            page.getByText('Email is not registered')
        ).toBeVisible();

        // Make sure it's still in the same page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Check if all fields are still filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user2.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user2.password);
    });

    test("should stay in login page if fields are empty", async ({ page }) => {
        // Go to Login Page
        await page.getByRole('link', { name: 'Login' }).click();
        await page.waitForURL("http://localhost:3000/login");

        // Simulate clicking login with empty fields
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that all the fields are empty
        await expect(page.getByRole('main')).toContainText('LOGIN FORM');
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();

        // Make sure it's still in the same page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");
    });

    test("should prompt user if password is invalid", async ({ page }) => {
        // Go to Login Page
        await page.getByRole('link', { name: 'Login' }).click();
        await page.waitForURL("http://localhost:3000/login");

        // Make sure page is now Login page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user2.password);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user2.password);

        // Login user
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // Might have some bug here ?
        await expect(
            page.getByText('Invalid Password')
        ).toBeVisible();

        // Make sure it's still in the same page
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Check if all fields are still filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user2.password);
    });
});
