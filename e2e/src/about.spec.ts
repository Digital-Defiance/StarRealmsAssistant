import { test, expect } from '@playwright/test';
import { APP_FEATURES, APP_MINI_DISCLAIMER, APP_MINI_DISCLAIMER_NOTE } from '@/game/constants';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Wait for a stable element like the main title first
  await expect(page.locator('h4')).toBeVisible();

  // Expect the title to be "Unofficial Star Realms Assistant".
  const title = await page.locator('h4').innerText();
  expect(title).toContain('Unofficial Star Realms Assistant');
});

test('has messages section', async ({ page }) => {
  await page.goto('/'); // Navigate to root path for AboutScreen
  // Wait for a stable element like the main title first
  await expect(page.locator('h4')).toBeVisible();

  // Check for the messages section (conditionally rendered)
  const messagesSection = page.locator('text=Messages');
  if ((await messagesSection.count()) > 0) {
    await expect(messagesSection).toBeVisible();
  }
});

test('has features list', async ({ page }) => {
  await page.goto('/');

  // Expect the features list to contain specific features.

  for (const feature of APP_FEATURES) {
    await expect(page.locator(`text=${feature}`)).toBeVisible();
  }
});

test('has version number', async ({ page }) => {
  await page.goto('/'); // Navigate to root path for AboutScreen
  // Wait for the main H4 title to be visible first
  await expect(page.locator('h4')).toBeVisible();

  // Expect the version number to be visible using getByText
  const versionElement = page.getByText(/Version:/); // Use regex for flexibility
  await expect(versionElement).toBeVisible();
  const versionText = await versionElement.textContent();
  expect(versionText).toContain('Version:');
});

test('has about section', async ({ page }) => {
  await page.goto('/'); // Navigate to root path for AboutScreen
  // Wait for the main H4 title to be visible first
  await expect(page.locator('h4')).toBeVisible();

  // Locate the specific Paper element for the "About" section
  const aboutPaper = page.locator('div.MuiPaper-root:has(span:text-is("About"))');
  await expect(aboutPaper).toBeVisible(); // Ensure the about section itself is visible

  const aboutText = [
    'This application is created by',
    'Digital Defiance',
    'Jessica Mulein',
    APP_MINI_DISCLAIMER,
    'For more information, contributions, or to report issues',
    APP_MINI_DISCLAIMER_NOTE,
    'See our Disclaimer for End Users for important information.',
    'User Manual',
  ];

  for (const text of aboutText) {
    // Use getByText within the located "About" paper
    await expect(aboutPaper.getByText(text)).toBeVisible();
  }
});
