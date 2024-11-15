import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the title to be "Unofficial Star Realms Assistant".
  const title = await page.locator('h4').innerText();
  expect(title).toContain('Unofficial Star Realms Assistant');
});

test('has features list', async ({ page }) => {
  await page.goto('/');

  // Expect the features list to contain specific features.
  const features = [
    'Player Management: Add, remove, and track multiple players',
    'Dynamic Scoring: Real-time calculation and leaderboard',
    'Game Setup Wizard: Customizable game modes and expansions',
    'Turn Tracking: Keep track of player turns and phases',
    'Detailed Game Log: Record and review game events',
    'Save/Load Games: Save progress and resume later',
    'Intuitive UI: User-friendly Material-UI components',
  ];

  for (const feature of features) {
    await expect(page.locator(`text=${feature}`)).toBeVisible();
  }
});
