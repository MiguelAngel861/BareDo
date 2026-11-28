import { expect, test } from '@playwright/test';

test('register a new user and land on home page', async ({ page }) => {
  await page.goto('/register');

  const username = `e2e_user_${Date.now()}`;
  const password = 'E2eTest123!';

  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.fill('#confirm-password', password);
  await page.click('#submit-btn');

  // After successful registration, redirect to home
  await expect(page).toHaveURL('/');
  await expect(page.locator('#auth-status')).toContainText(username);
});

test('login with existing user and land on home page', async ({ page }) => {
  const username = `e2e_user_${Date.now()}`;
  const password = 'E2eTest123!';

  // Register first so the user exists
  await page.goto('/register');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.fill('#confirm-password', password);
  await page.click('#submit-btn');
  await expect(page).toHaveURL('/');

  // Logout to test login flow separately
  await page.click('#logout-btn');
  await expect(page).toHaveURL('/login');

  // Login again
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#submit-btn');

  await expect(page).toHaveURL('/');
  await expect(page.locator('#auth-status')).toContainText(username);
});
