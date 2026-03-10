/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';
import { mockJobs, mockTargets } from './fixtures/test-data';

// ---------------------------------------------------------------------------
// Mock run history data
// ---------------------------------------------------------------------------

const mockRuns = [
  {
    id: 'run-1',
    job_id: 'j1',
    status: 'success',
    started_at: '2024-06-15T10:00:00Z',
    finished_at: '2024-06-15T10:05:00Z',
    duration_seconds: 300,
    size_bytes: 524288000,
    files_new: 10,
    files_changed: 2,
    files_unmodified: 100,
    error: null,
  },
  {
    id: 'run-2',
    job_id: 'j1',
    status: 'failure',
    started_at: '2024-06-14T10:00:00Z',
    finished_at: '2024-06-14T10:01:00Z',
    duration_seconds: 60,
    size_bytes: 0,
    files_new: 0,
    files_changed: 0,
    files_unmodified: 0,
    error: 'Connection refused',
  },
];

// ---------------------------------------------------------------------------
// Route setup helper
// ---------------------------------------------------------------------------

async function mockBackupRoutes(page: Page) {
  await mockSetupComplete(page);

  // Jobs list
  await page.route('**/api/jobs', (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobs: mockJobs, items: mockJobs, total: mockJobs.length }),
      });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() || {};
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'j-new', name: body.name || 'New Job', ...body }),
      });
    }
    return route.continue();
  });

  // Individual job
  await page.route('**/api/jobs/*', (route, request) => {
    const url = request.url();
    const id = url.split('/api/jobs/')[1]?.split('/')[0];
    if (request.method() === 'GET' && id && !url.includes('/runs')) {
      const job = mockJobs.find((j) => j.id === id) || mockJobs[0];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(job),
      });
    }
    return route.continue();
  });

  // Job runs — matches /api/jobs/runs, /api/jobs/:id/runs, and /api/jobs/:id/history
  await page.route('**/api/jobs/runs*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockRuns, runs: mockRuns, total: mockRuns.length }),
    })
  );

  await page.route('**/api/jobs/*/runs*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockRuns, runs: mockRuns, total: mockRuns.length }),
    })
  );

  // The API client calls /jobs/:id/history for run history
  await page.route('**/api/jobs/*/history*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockRuns, runs: mockRuns, total: mockRuns.length }),
    })
  );

  // Targets list
  await page.route('**/api/targets', (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ targets: mockTargets, items: mockTargets, total: mockTargets.length }),
      });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() || {};
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'tgt-new', name: body.name || 'New Target', ...body }),
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

test.describe('Backup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackupRoutes(page);
  });

  test('create target form is accessible', async ({ page }) => {
    await page.goto('/settings/targets', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // An "Add Target" or similar button must be present.
    const addBtn = page.getByRole('button', { name: /add target|add|new target/i }).first();
    await expect(addBtn).toBeVisible();

    // Clicking the button should reveal a form with at least one input.
    await addBtn.click();
    await expect(page.locator('input, select').first()).toBeVisible();
  });

  test('create job form is accessible', async ({ page }) => {
    await page.goto('/settings/jobs', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');

    // An "Add Job" or similar button must be present.
    const addBtn = page
      .getByRole('button', { name: /add job|add|new job|create/i })
      .first();
    await expect(addBtn).toBeVisible();

    // Clicking the button should open the form with at least one input.
    await addBtn.click();
    await expect(page.locator('input, select').first()).toBeVisible();
  });

  test('backup jobs page loads and lists jobs', async ({ page }) => {
    await page.goto('/settings/jobs', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');

    // Mock jobs are "DB Dumps", "Cloud Sync", "Flash Backup" — at least one must appear.
    const jobName = page
      .getByText('DB Dumps')
      .or(page.getByText('Cloud Sync'))
      .or(page.getByText('Flash Backup'));
    await expect(jobName.first()).toBeVisible();
  });

  test('backups page loads and shows job list', async ({ page }) => {
    await page.goto('/backups', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');

    // Mock jobs "DB Dumps", "Cloud Sync", "Flash Backup" — at least one must appear.
    const jobName = page
      .getByText('DB Dumps')
      .or(page.getByText('Cloud Sync'))
      .or(page.getByText('Flash Backup'));
    await expect(jobName.first()).toBeVisible();
  });

  test('run history is visible on the backups page', async ({ page }) => {
    await page.goto('/backups', { waitUntil: 'networkidle' });

    // Mock runs have status "success" and "failed" rendered by StatusBadge spans.
    // Use a visible span selector to avoid matching hidden <option> elements in FilterBar.
    const runStatus = page
      .locator('span', { hasText: 'success' })
      .or(page.locator('span', { hasText: 'failed' }))
      .or(page.locator('span', { hasText: 'running' }))
      .or(page.getByText('Connection refused'));
    await expect(runStatus.first()).toBeVisible();
  });

  test('job actions are accessible on the backups page', async ({ page }) => {
    await page.goto('/backups', { waitUntil: 'networkidle' });

    // There must be at least one interactive button (e.g. "Run Now", "Details").
    await expect(page.getByRole('button').first()).toBeVisible();
  });
});
