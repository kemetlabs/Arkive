/**
 * Setup Wizard UI Tests
 *
 * The frontend forces demo mode (mock API) so the real /api/auth/setup
 * endpoint is not called from the browser.  These tests verify the
 * setup wizard UI renders correctly and the multi-step form works.
 *
 * NOTE: Because demo mode returns setup_completed: true by default,
 * the layout redirects away from /setup.  We use page.addInitScript
 * to patch the mock so that setup_completed starts as false, then
 * test the wizard flow.
 */

import { test, expect } from '@playwright/test';

test.describe('Setup Wizard UI', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API routes so the layout thinks setup is NOT complete.
    // This lets us stay on /setup without being redirected.
    await page.route('**/api/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: false }),
      })
    );
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ setup_required: true }),
      })
    );
    await page.route('**/api/events/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
    );
    // Mock discover endpoint for step 2 (Container Discovery)
    await page.route('**/api/discover/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ containers: [], items: [], total: 0 }),
      })
    );
    // Mock directories endpoint for step 5
    await page.route('**/api/directories/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ directories: [], items: [], total: 0, suggestions: [] }),
      })
    );

    await page.addInitScript(() => {
      localStorage.removeItem('arkive_api_key');
      localStorage.removeItem('arkive_theme');
    });
  });

  test('Setup page loads and shows step 1', async ({ page }) => {
    await page.goto('/setup');
    // The heading "Arkive Setup" should appear
    await expect(page.locator('h1')).toContainText('Arkive Setup');
    // Step 1 heading
    await expect(page.locator('h2')).toContainText('Encryption Password');
  });

  test('Setup page shows progress indicators', async ({ page }) => {
    await page.goto('/setup');
    // There should be 6 step circles
    const stepCircles = page.locator('.rounded-full');
    await expect(stepCircles).toHaveCount(6);
  });

  test('Step 1 next button disabled with empty password', async ({ page }) => {
    await page.goto('/setup');
    const nextBtn = page.locator('button:has-text("Next")');
    await expect(nextBtn).toBeDisabled();
  });

  test('Step 1 next button enabled after valid password entry', async ({ page }) => {
    await page.goto('/setup');
    const passwordInputs = page.locator('input[type="password"]');
    // Fill both password fields with matching 12+ char password
    await passwordInputs.nth(0).fill('securepassword123');
    await passwordInputs.nth(1).fill('securepassword123');
    const nextBtn = page.locator('button:has-text("Next")');
    await expect(nextBtn).toBeEnabled();
  });

  test('Can navigate from step 1 to step 2', async ({ page }) => {
    await page.goto('/setup');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('securepassword123');
    await passwordInputs.nth(1).fill('securepassword123');
    await page.locator('button:has-text("Next")').click();
    // Step 2 heading: Container Discovery
    await expect(page.locator('h2')).toContainText('Container Discovery');
  });

  test('Step 3 shows all storage providers', async ({ page }) => {
    await page.goto('/setup');
    // Navigate through step 1 and step 2 (Container Discovery) to reach step 3 (Backup Destination)
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('securepassword123');
    await passwordInputs.nth(1).fill('securepassword123');
    await page.locator('button:has-text("Next")').click();
    // Step 2: Container Discovery — scan then proceed
    await expect(page.locator('h2')).toContainText('Container Discovery');
    await page.locator('button:has-text("Scan for Containers")').click();
    await page.locator('button:has-text("Next")').click();

    // Check that provider options appear using their label text (inside the buttons)
    await expect(page.getByText('Backblaze B2', { exact: true })).toBeVisible();
    await expect(page.getByText('Amazon S3', { exact: true })).toBeVisible();
    await expect(page.getByText('Wasabi', { exact: true })).toBeVisible();
    await expect(page.getByText('SFTP Server', { exact: true })).toBeVisible();
    await expect(page.getByText('Local Path', { exact: true })).toBeVisible();
  });

  test('Can navigate through all steps', async ({ page }) => {
    await page.goto('/setup');

    // Step 1: Fill passwords
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('securepassword123');
    await passwordInputs.nth(1).fill('securepassword123');
    await page.locator('button:has-text("Next")').click();

    // Step 2: Container Discovery — scan then proceed
    await expect(page.locator('h2')).toContainText('Container Discovery');
    await page.locator('button:has-text("Scan for Containers")').click();
    await page.locator('button:has-text("Next")').click();

    // Step 3: Backup Destination — select local storage
    await expect(page.locator('h2')).toContainText('Backup Destination');
    await page.locator('button:has-text("Local Path")').click();
    // Local path has a default value, so Next should become enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
    await page.locator('button:has-text("Next")').click();

    // Step 4: Schedule page
    await expect(page.locator('h2')).toContainText('Backup Schedule');
    // The schedule inputs should have default values
    const scheduleInputs = page.locator('input.font-mono');
    await expect(scheduleInputs.first()).not.toHaveValue('');
    await page.locator('button:has-text("Next")').click();

    // Step 5: Directories page
    await expect(page.locator('h2')).toContainText('Directories to Watch');
  });

  test('Back buttons work correctly', async ({ page }) => {
    await page.goto('/setup');

    // Go to step 2
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('securepassword123');
    await passwordInputs.nth(1).fill('securepassword123');
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('h2')).toContainText('Container Discovery');

    // Go back to step 1 — use getByRole for exact match
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('h2')).toContainText('Encryption Password');
  });
});
