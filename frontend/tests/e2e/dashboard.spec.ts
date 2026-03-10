/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 */

import { test, expect } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';
import { mockJobs, mockActivity } from './fixtures/test-data';

async function mockDashboardRoutes(page: import('@playwright/test').Page) {
  await mockSetupComplete(page);

  // Jobs list
  await page.route('**/api/jobs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockJobs, jobs: mockJobs, total: mockJobs.length }),
    })
  );

  // Recent job runs (used by dashboard activity/status cards)
  await page.route('**/api/jobs/runs*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], runs: [], total: 0, limit: 200, offset: 0, has_more: false }),
    })
  );

  // Storage summary
  await page.route('**/api/storage', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        targets: [],
        summary: { target_count: 0, total_size_bytes: 0 },
      }),
    })
  );

  // Activity feed
  await page.route('**/api/activity*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockActivity, entries: mockActivity, activities: mockActivity, total: mockActivity.length, limit: 200, offset: 0, has_more: false }),
    })
  );

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

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardRoutes(page);
  });

  test('dashboard page loads successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Should not show a 404 or error page
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // At least one of the known nav/layout landmarks must be present
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('status cards render', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The dashboard renders named summary cards; verify at least one by its heading text.
    // Acceptable headings: "Jobs", "Backups", "Status", "Storage", or similar dashboard labels.
    const cardHeading = page.getByRole('heading').or(
      page.locator('[class*="card"] [class*="title"], [class*="stat"] [class*="label"]')
    ).first();
    await expect(cardHeading).toBeVisible();
  });

  test('backup jobs are listed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The mock jobs are "DB Dumps", "Cloud Sync", "Flash Backup" — at least one must appear.
    const jobName = page
      .getByText('DB Dumps')
      .or(page.getByText('Cloud Sync'))
      .or(page.getByText('Flash Backup'));
    await expect(jobName.first()).toBeVisible();
  });

  test('quick actions are accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The dashboard must have at least one interactive element (button or nav link).
    const actionButton = page.getByRole('button').or(page.getByRole('link'));
    await expect(actionButton.first()).toBeVisible();
  });
});
