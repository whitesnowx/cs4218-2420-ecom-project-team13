import { test, expect } from "@playwright/test";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

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

let mongoServer;
let uri

test.describe("Register page", () => {
    test.beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        uri = await mongoServer.getUri();
    });

    test.beforeEach(async ({ page }) => {
        await mongoose.connect(uri);
        await mongoose.connection.createCollection("users");

        await page.goto('http://localhost:3000/');
        await page.waitForURL("http://localhost:3000/");
    });

    test.afterEach(async () => {
        await userModel.deleteOne({ email: user.email });
        await mongoose.disconnect();
    });

    test.afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    })

    test("should register user successfully", async ({ page }) => {
        // Go to Register Page
        await page.getByRole('link', { name: 'Register' }).click();
        await page.waitForURL("http://localhost:3000/register");

        // Make sure page is now Register page
        await expect(page).toHaveURL(/register/);
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toHaveText("REGISTER FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(user.name);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(user.phone);
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(user.address);
        await page.getByPlaceholder('Enter Your DOB').fill('2006-06-14');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(user.answer);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(user.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user.password);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(user.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(user.address);
        await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2006-06-14');
        await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue(user.answer);

        // Register user
        await page.getByRole('button', { name: 'REGISTER' }).click();
        await expect(
            page.getByText("Register Successfully, please login")
        ).toBeVisible();

        // Wait for URL to change to Login page
        await page.waitForURL("http://localhost:3000/login");

        // Assert
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");
    });

    test("should prompt that user has already been registered", async ({ page }) => {
        // Go to Register Page
        await page.getByRole('link', { name: 'Register' }).click();
        await page.waitForURL("http://localhost:3000/register");

        // Make sure page is now Register page
        await expect(page).toHaveURL(/register/);
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toHaveText("REGISTER FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(user.name);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(user.phone);
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(user.address);
        await page.getByPlaceholder('Enter Your DOB').fill('2006-06-14');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(user.answer);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(user.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user.password);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(user.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(user.address);
        await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2006-06-14');
        await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue(user.answer);

        // Register user
        await page.getByRole('button', { name: 'REGISTER' }).click();
        await expect(
            page.getByText("Register Successfully, please login")
        ).toBeVisible();

        // Wait for URL to change to Login page
        await page.waitForURL("http://localhost:3000/login");

        // Assert
        await expect(page).toHaveURL(/login/);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toHaveText("LOGIN FORM");

        // Go to Register Page to create another account with same email
        await page.getByRole('link', { name: 'Register' }).click();
        await page.waitForURL("http://localhost:3000/register");

        // Make sure page is now Register page
        await expect(page).toHaveURL(/register/);
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toHaveText("REGISTER FORM");

        // Fill in form with user details
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(user.name);
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(user.phone);
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(user.address);
        await page.getByPlaceholder('Enter Your DOB').fill('2006-06-14');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(user.answer);

        // Make sure the fields are filled
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(user.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user.password);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(user.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(user.address);
        await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2006-06-14');
        await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue(user.answer);

        // Register user
        await page.getByRole('button', { name: 'REGISTER' }).click();
        await expect(
            page.getByText("Already registered. Please login")
        ).toBeVisible();

        // Fields are still filled after clicking register
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(user.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(user.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(user.password);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(user.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(user.address);
        await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2006-06-14');
        await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue(user.answer);
    });

    test("should stay in register page if fields are empty", async ({ page }) => {
        // Go to Register Page
        await page.getByRole('link', { name: 'Register' }).click();
        await page.waitForURL("http://localhost:3000/register");

        // Simulate clicking register with empty fields
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Check that all the fields are empty
        await expect(page.getByRole('main')).toContainText('REGISTER FORM');
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeEmpty();
        await expect(page.getByPlaceholder('Enter Your DOB')).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toBeEmpty();

        // Make sure it's still in the same page
        await expect(page).toHaveURL(/register/);
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toHaveText("REGISTER FORM");
    });
});
