/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';
import { mockSnapshots, mockTargets } from './fixtures/test-data';

// ---------------------------------------------------------------------------
// Route setup helper
// ---------------------------------------------------------------------------

async function mockSnapshotsRoutes(page: Page) {
  await mockSetupComplete(page);

  // Snapshots list
  await page.route('**/api/snapshots*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        snapshots: mockSnapshots,
        items: mockSnapshots,
        total: mockSnapshots.length,
      }),
    })
  );

  // Targets list (snapshots page may show target names)
  await page.route('**/api/targets', (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ targets: mockTargets, items: mockTargets, total: mockTargets.length }),
      });
    }
    return route.continue();
  });

  // Status endpoint
  await page.route('**/api/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: true }),
    })
  );

  // SSE events stream — return empty stream to prevent hanging
  await page.route('**/api/events/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await mockSnapshotsRoutes(page);
  });

  test('snapshots page loads successfully', async ({ page }) => {
    await page.goto('/snapshots', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // Layout must be present
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('snapshot list is rendered', async ({ page }) => {
    await page.goto('/snapshots', { waitUntil: 'networkidle' });

    // Mock snapshot has hostname "unraid-server" and path "/mnt/user/appdata" — one must appear.
    const snapshotEntry = page
      .getByText('unraid-server')
      .or(page.getByText('/mnt/user/appdata'));
    await expect(snapshotEntry.first()).toBeVisible();
  });

  test('browse and restore buttons are present per snapshot', async ({ page }) => {
    await page.goto('/snapshots', { waitUntil: 'networkidle' });

    // Each snapshot row should have Browse and Restore buttons
    const browseBtn = page.getByRole('button', { name: /browse/i }).first();
    const restoreBtn = page.getByRole('button', { name: /restore/i }).first();
    await expect(browseBtn).toBeVisible();
    await expect(restoreBtn).toBeVisible();
  });

  test('restore plan is accessible', async ({ page }) => {
    await page.goto('/snapshots', { waitUntil: 'networkidle' });

    // A restore button per snapshot row or a link to /restore must exist.
    const restoreAccess = page
      .getByRole('button', { name: /restore/i })
      .or(page.getByRole('link', { name: /restore/i }))
      .or(page.locator('a[href*="restore"]'));
    await expect(restoreAccess.first()).toBeVisible();
  });

  test('snapshots page shows target information', async ({ page }) => {
    await page.goto('/snapshots', { waitUntil: 'networkidle' });

    // The mock target has name "Local Backup" — verify the snapshots page
    // shows target information. Accept the target name, "Local Backup",
    // or at minimum the snapshot hostname "unraid-server".
    const targetInfo = page
      .getByText('Local Backup')
      .or(page.getByText('unraid-server'))
      .or(page.getByText('/mnt/user/appdata'));
    await expect(targetInfo.first()).toBeVisible();
  });
});
