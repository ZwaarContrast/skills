// The own-goal guard: proves a performance fix did not change what the page looks like.
// Copy this next to the scenario it mirrors, replace the stops with the scenario's
// steps, then run it three times:
//
//   npm i @playwright/test
//   npx playwright test visual.spec.js    # 1. writes baselines. Before the fix.
//   npx playwright test visual.spec.js    # 2. must pass. If it fails against its own
//                                         #    baseline, the page is not deterministic
//                                         #    enough to guard — mask what moves.
//   <apply the fix>
//   npx playwright test visual.spec.js    # 3. fails on any visual change.
//
// Then prove the guard bites: change a colour on purpose and confirm run 3 fails.
// A guard nobody has seen fail is not a guard.
const { test, expect } = require('@playwright/test');

const APP = process.env.APP || 'http://localhost:7777';

test('looks the same through the scenario', async ({ page }) => {
  await page.goto(APP);
  await page.waitForLoadState('networkidle');

  // Keep the defaults. maxDiffPixelRatio: 0.01 sounds cautious and is not: a
  // colour change covering 1029 pixels of a 1280×720 viewport sits exactly on
  // that line and passes. Mask what is genuinely dynamic instead — a clock, an
  // id, a random avatar — because a mask blinds one box and a threshold blinds
  // the whole page:
  //   { mask: [page.locator('.timestamp')] }
  const shot = { animations: 'disabled', caret: 'hide' };

  await expect(page).toHaveScreenshot('01-loaded.png', shot);

  // --- the scenario's stops. One screenshot per state worth preserving. ---
  await page.click('#add');
  await expect(page).toHaveScreenshot('02-rows-added.png', shot);

  await page.click('#search');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('03-searched.png', shot);
  // -----------------------------------------------------------------------

  // For a scroll scenario, screenshot the scrolled state too — virtualisation
  // fixes look identical at the top of the page and completely different below.
  await page.evaluate(() => scrollTo(0, 1200));
  await expect(page).toHaveScreenshot('04-scrolled.png', shot);
});
