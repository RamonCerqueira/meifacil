import { test, expect } from '@playwright/test';

test('should allow a user to login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Entrar")');

  // Expects the URL to contain dashboard after login
  await expect(page).toHaveURL(/.*dashboard/);
});

test('should show an error with invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', 'invalid@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button:has-text("Entrar")');

  // Expects an error message to be visible
  await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
});


