import { test, expect } from '@playwright/test';

test('Startseite lädt korrekt', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/QuickWork/i);
});

test('Login-Seite ist erreichbar', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByRole('button', { name: /Anmelden/i })).toBeVisible();
});

test('Navigation von Startseite zur Login-Seite funktioniert', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByRole('link', { name: /Anmelden/i }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: /Anmelden/i })).toBeVisible();
});

