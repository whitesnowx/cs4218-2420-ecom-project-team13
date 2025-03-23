// @ts-check
const { test, expect } = require('@playwright/test');

test('no items, quest view', async ({ page }) => {
  await page.goto('http://localhost:3000/cart'); 

  const header = await page.locator('h1.text-center');
  await expect(header).toContainText('Hello Guest'); //

  const headerp = await page.locator('h1.text-center p.text-center');
  await expect(headerp).toContainText('Your Cart Is Empty'); //

  const cartItems = await page.locator('.row.card');
  await expect(cartItems).toHaveCount(0); 

  const totalPrice = await page.locator('.cart-summary h4');
  await expect(totalPrice).toContainText('Total : $0.00');

  
//   const checkoutbtn = await page.locator('.btn-outline-warning');
//   await expect(checkoutbtn).toBeVisible();
//   await expect(totalPrice).toContainText('Plase Login to checkout');




});
