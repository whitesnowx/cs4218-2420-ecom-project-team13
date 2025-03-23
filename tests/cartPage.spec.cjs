// @ts-check
const { test, expect } = require('@playwright/test');
import dotenv from 'dotenv';

test.describe('not logged in', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/cart'); 
      });
 
    test.describe('no items', () => {
        test('empty cart', async ({ page }) => {

            const header = await page.locator('h1.text-center');
            await expect(header).toContainText('Hello Guest');

            const headerp = await page.locator('h1.text-center p.text-center');
            await expect(headerp).toContainText('Your Cart Is Empty');

            const cartItems = await page.locator('.row.card');
            await expect(cartItems).toHaveCount(0); 

            const totalPrice = await page.locator('.cart-summary h4');
            // const totalText1 = await totalPrice;

            await expect(totalPrice).toContainText('Total : $0.00');
            // await expect(totalText2).toContainText('$0.00');
        });

        test('login prompt button', async ({ page }) => {
            const promptLoginBtn = await page.locator('.btn-outline-warning');
            await expect(promptLoginBtn).toBeVisible();
            await expect(promptLoginBtn).toContainText('Please Login to checkout');
        
            const buttonColorWhenEnabled = await promptLoginBtn.evaluate(button => window.getComputedStyle(button).backgroundColor);
            expect(buttonColorWhenEnabled).toBe('rgba(0, 0, 0, 0)'); // Color should not be gray now
        
        });
    });
});

test.describe('logged in', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login'); 
        const emailInput = await page.locator('#exampleInputEmail1');
        await emailInput.fill('mytest@test.com');
        const passwordInput = await page.locator('#exampleInputPassword1');
        await passwordInput.fill('test');

        const loginButton = await page.locator('button.btn.btn-primary');
        await expect(loginButton).toBeVisible();

        await loginButton.click();
        await page.waitForNavigation();
        await page.goto('http://localhost:3000/cart'); 

    });
    test.describe('no items', () => {
        test('empty cart', async ({ page }) => {

            const header = await page.locator('h1');
            // const header = await page.locator('.col-md-12 h1.text-center.bg-light.p-2.mb-1');
            await expect(header).toContainText('Hello kaylee test Your Cart Is Empty'); 

            const addressText = await page.locator('.mb-3 h4');
            await expect(addressText).toContainText('Current Address'); 

            const addressUser = await page.locator('.mb-3 h5');
            await expect(addressUser).toContainText('homeless'); 

            const checkoutbtn = await page.locator('.btn-outline-warning');
            await expect(checkoutbtn).toBeVisible();
            await expect(checkoutbtn).toContainText('Update Address');
        });
    });

    test.describe('have items', () => {
        let totalpriceRef;
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:3000');  
            const priceText = await page.locator(' .card-title.card-price').first().innerText();
            const priceNum = parseFloat(priceText.replace('$', '')); // Remove "$" and convert to a number
            totalpriceRef = priceNum * 2; // Get 2x the price
            // const formattedDoublePrice = `$${doublePrice.toFixed(2)}`;
            // console.log(formattedDoublePrice);

            const addItemBtn = await page.locator('.card-name-price button.btn.btn-dark').first();
            await addItemBtn.click();
            await addItemBtn.click();

            await page.goto('http://localhost:3000/cart'); 

        });

        test('non-empty cart', async ({ page }) => {
            const header = await page.locator('h1.text-center');
            await expect(header).toContainText('Hello kaylee test'); 

            const headerp = await page.locator('h1.text-center p.text-center');
            await expect(headerp).toContainText('You Have 2 items in your cart');

            const cartItems = await page.locator('.row.card');
            await expect(cartItems).toHaveCount(2); 

            const totalPrice = await page.locator('.cart-summary h4').nth(0);
            // const totalPrice = await page.locator('.cart-summary h4:has-text("Total :")');
            await expect(totalPrice).toContainText(`Total : $${totalpriceRef.toFixed(2)}`);
            
        });
        test('dropIn and payment button', async ({ page }) => {
            const dropInCard = await page.locator('.braintree-option.braintree-option__card');
            await dropInCard.waitFor({ state: 'visible', timeout: 5000 });
            
            const dropInPaypal = await page.locator('.braintree-option.braintree-option__paypal');
            await dropInPaypal.waitFor({ state: 'visible', timeout: 5000 });
            // await expect(dropIn).toBeVisible();

            const promptLoginBtn = await page.locator('.mt-2 .btn.btn-primary');
            await expect(promptLoginBtn).toBeVisible();
            await expect(promptLoginBtn).toContainText('Make Payment');
        
            const buttonColorWhenEnabled = await promptLoginBtn.evaluate(button => window.getComputedStyle(button).backgroundColor);
            expect(buttonColorWhenEnabled).toBe('rgb(13, 110, 253)'); 
            
        });
    });
});

