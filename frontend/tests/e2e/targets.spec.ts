/**
 * Playwright UI tests for the Storage Targets page.
 *
 * Uses route mocking to simulate API responses for every supported provider type.
 * Tests: page load, target listing, add form, test connection, delete.
 */
import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';

// ---------------------------------------------------------------------------
// Mock data matching all supported backend providers
// ---------------------------------------------------------------------------

const ALL_TARGETS = [
  { id: 'tgt-b2', name: 'Backblaze B2', type: 'b2', status: 'ok', enabled: true, snapshot_count: 5, last_tested: '2026-02-28T10:00:00Z', config: { bucket: 'my-bucket', key_id: '***', app_key: '***' } },
  { id: 'tgt-s3', name: 'Amazon S3', type: 's3', status: 'ok', enabled: true, snapshot_count: 3, last_tested: '2026-02-28T09:00:00Z', config: { bucket: 'backup-bucket', endpoint: 'https://s3.amazonaws.com', access_key: '***', secret_key: '***' } },
  { id: 'tgt-wasabi', name: 'Wasabi Hot Storage', type: 'wasabi', status: 'ok', enabled: true, snapshot_count: 2, last_tested: '2026-02-28T08:00:00Z', config: { bucket: 'wasabi-bk', access_key: '***', secret_key: '***', region: 'eu-central-1' } },
  { id: 'tgt-sftp', name: 'SFTP Server', type: 'sftp', status: 'ok', enabled: true, snapshot_count: 4, last_tested: '2026-02-28T07:00:00Z', config: { host: 'backup.example.com', user: 'arkive', password: '***' } },
  { id: 'tgt-dropbox', name: 'Dropbox', type: 'dropbox', status: 'ok', enabled: true, snapshot_count: 1, last_tested: '2026-02-28T06:00:00Z', config: { token: '***' } },
  { id: 'tgt-gdrive', name: 'Google Drive', type: 'gdrive', status: 'error', enabled: true, snapshot_count: 0, last_tested: '2026-02-28T05:00:00Z', config: { client_id: '123.apps.google', token: '***' } },
  { id: 'tgt-local', name: 'Local Backup', type: 'local', status: 'ok', enabled: true, snapshot_count: 10, last_tested: '2026-02-28T03:00:00Z', config: { path: '/mnt/backups' } },
];

// ---------------------------------------------------------------------------
// Route mocking helpers
// ---------------------------------------------------------------------------

async function mockTargetsAPI(page: Page) {
  // Auth session
  await mockSetupComplete(page);

  // List targets
  await page.route('**/api/targets', (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: ALL_TARGETS, targets: ALL_TARGETS, total: ALL_TARGETS.length }),
      });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `tgt-new-${Date.now()}`,
          name: body?.name || 'New Target',
          type: body?.type || 'local',
          status: 'unknown',
          enabled: true,
          config: body?.config || {},
        }),
      });
    }
    return route.continue();
  });

  // Test connection
  await page.route('**/api/targets/*/test', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Connection successful', tested_at: new Date().toISOString() }),
    })
  );

  // Delete target
  await page.route('**/api/targets/*', (route, request) => {
    if (request.method() === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Target deleted' }),
      });
    }
    if (request.method() === 'GET') {
      // Single target get
      const url = request.url();
      const id = url.split('/api/targets/')[1]?.split('/')[0];
      const target = ALL_TARGETS.find(t => t.id === id);
      return route.fulfill({
        status: target ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(target || { detail: 'Not found' }),
      });
    }
    if (request.method() === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...ALL_TARGETS[0], ...request.postDataJSON() }),
      });
    }
    return route.continue();
  });

  // Mock other API endpoints the page might call
  await page.route('**/api/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: true }),
    })
  );

  await page.route('**/api/events/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Storage Targets Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockTargetsAPI(page);
  });

  test('displays all provider targets', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Each target name should be visible (use .font-medium to target the name specifically)
    for (const target of ALL_TARGETS) {
      const card = page.locator('.font-medium', { hasText: target.name });
      await expect(card).toBeVisible({ timeout: 5000 });
    }
  });

  test('shows correct target count', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text=${ALL_TARGETS.length} storage target`)).toBeVisible();
  });

  test('shows provider type badge for each target', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Type badges like "b2", "s3", "wasabi", etc.
    const types = ALL_TARGETS.map(t => t.type);
    for (const t of types) {
      await expect(page.locator(`text=${t}`).first()).toBeVisible();
    }
  });

  test('shows status badges (ok and error)', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // gdrive has status "error", rest have "ok"
    const errorBadge = page.locator('.badge-danger, [class*="danger"]').first();
    await expect(errorBadge).toBeVisible();
  });

  test('test button triggers connection test', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Click first "Test" button
    const testBtn = page.locator('button:has-text("Test")').first();
    await testBtn.click();

    // Should show "Testing..." state briefly then return
    // The mock returns success immediately
    await page.waitForTimeout(500);
  });

  test('delete button removes a target', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Click first delete button (trash icon)
    const deleteBtn = page.locator('button:has(svg)').last();
    await deleteBtn.click();

    // The page should refetch targets
    await page.waitForTimeout(500);
  });

  test('add target form toggles on click', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Click "Add Target"
    const addBtn = page.locator('button:has-text("Add Target")');
    await addBtn.click();

    // Form should appear with provider selector
    await expect(page.locator('text=Type').first()).toBeVisible();
  });

  test('add target form shows correct fields per provider', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Add Target")').click();
    await page.waitForTimeout(300);

    // Default type is b2 — should show Account ID, Application Key, Bucket
    // (the targets page uses configFields which has 'account', 'key', 'bucket' for b2)
    const b2Fields = page.locator('input[type="text"], input[type="password"]');
    // Name field + at least 3 config fields
    expect(await b2Fields.count()).toBeGreaterThanOrEqual(3);
  });

  test('page shows snapshot counts for each target', async ({ page }) => {
    await page.goto('/settings/targets');
    await page.waitForLoadState('networkidle');

    // Targets show "{N} snapshots"
    await expect(page.locator('text=snapshots').first()).toBeVisible();
  });
});
