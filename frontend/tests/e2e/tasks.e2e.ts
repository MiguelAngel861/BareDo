import { expect, test } from '@playwright/test';

test('create a task after logging in', async ({ page }) => {
  const username = `e2e_task_user_${Date.now()}`;
  const password = 'E2eTest123!';

  // Register and login
  await page.goto('/register');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.fill('#confirm-password', password);
  await page.click('#submit-btn');
  await expect(page).toHaveURL('/');

  // Open create task modal
  await page.click('#open-create-task-btn');
  await expect(page.locator('#task-form')).toBeVisible();

  // Fill task title (min 5 chars, max 40)
  await page.fill('#title', 'E2E Test Task');
  await page.click('#submit-btn');

  // Modal should close and task should appear in the list
  await expect(page.locator('text=E2E Test Task')).toBeVisible();
});
