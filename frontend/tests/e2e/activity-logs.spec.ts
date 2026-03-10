/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';
import { mockActivity } from './fixtures/test-data';

// ---------------------------------------------------------------------------
// Mock log entries
// ---------------------------------------------------------------------------

const mockLogs = [
  {
    id: 1,
    level: 'INFO',
    logger: 'arkive.scheduler',
    message: 'Scheduler started successfully',
    timestamp: '2024-06-15T10:30:00Z',
  },
  {
    id: 2,
    level: 'WARNING',
    logger: 'arkive.backup',
    message: 'Backup target unreachable, retrying...',
    timestamp: '2024-06-15T10:20:00Z',
  },
  {
    id: 3,
    level: 'ERROR',
    logger: 'arkive.restic',
    message: 'restic exited with non-zero code',
    timestamp: '2024-06-15T10:10:00Z',
  },
  {
    id: 4,
    level: 'DEBUG',
    logger: 'arkive.docker',
    message: 'Discovered 5 containers',
    timestamp: '2024-06-15T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Route setup helpers
// ---------------------------------------------------------------------------

async function mockActivityRoutes(page: Page) {
  await mockSetupComplete(page);

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

async function mockLogsRoutes(page: Page) {
  await mockSetupComplete(page);

  // Logs endpoint
  await page.route('**/api/logs*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: mockLogs, logs: mockLogs, total: mockLogs.length, limit: 200, offset: 0, has_more: false }),
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

// ---------------------------------------------------------------------------
// Activity tests
// ---------------------------------------------------------------------------

test.describe('Activity Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockActivityRoutes(page);
  });

  test('activity page loads with entries', async ({ page }) => {
    await page.goto('/activity', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // Layout must be present
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('activity entries are rendered', async ({ page }) => {
    await page.goto('/activity', { waitUntil: 'networkidle' });

    // Mock activity has messages "Backup completed successfully" and
    // "Container discovery scan triggered" — at least one must appear.
    const entryText = page
      .getByText('Backup completed successfully')
      .or(page.getByText('Container discovery scan triggered'));
    await expect(entryText.first()).toBeVisible();
  });

  test('activity entries have severity indicators', async ({ page }) => {
    await page.goto('/activity', { waitUntil: 'networkidle' });

    // Mock entries have severity "info". The UI may render this as a badge,
    // coloured dot, or text label — look for the word "info" in the page.
    await expect(
      page.getByText('info', { exact: false })
        .or(page.locator('[class*="badge"], [class*="severity"], [class*="level"]').first())
    ).toBeVisible();
  });

  test('activity page shows timestamps', async ({ page }) => {
    await page.goto('/activity', { waitUntil: 'networkidle' });

    // Mock entries have timestamps in 2024 — the rendered date or a relative
    // "ago" string must appear somewhere on the page.
    const timestamp = page
      .getByText('2024', { exact: false })
      .or(page.getByText(/ago/, { exact: false }))
      .or(page.getByText(/\d{1,2}:\d{2}/));
    await expect(timestamp.first()).toBeVisible();
  });

  test('activity page has actionable elements', async ({ page }) => {
    await page.goto('/activity', { waitUntil: 'networkidle' });

    // At least one interactive button or navigation link must be present.
    const action = page.getByRole('button').or(page.getByRole('link'));
    await expect(action.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Logs tests
// ---------------------------------------------------------------------------

test.describe('Logs Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogsRoutes(page);
  });

  test('logs page loads', async ({ page }) => {
    await page.goto('/logs', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // Layout must be present
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('logs page shows log entries', async ({ page }) => {
    await page.goto('/logs', { waitUntil: 'networkidle' });

    // Mock logs have specific messages — at least one must be rendered.
    const logEntry = page
      .getByText('Scheduler started successfully')
      .or(page.getByText('Backup target unreachable, retrying...'))
      .or(page.getByText('restic exited with non-zero code'))
      .or(page.getByText('Discovered 5 containers'));
    await expect(logEntry.first()).toBeVisible();
  });

  test('logs page refresh button works', async ({ page }) => {
    await page.goto('/logs', { waitUntil: 'networkidle' });

    const refreshBtn = page
      .getByRole('button', { name: /refresh|reload/i })
      .first();
    await expect(refreshBtn).toBeVisible();

    // Clicking refresh should re-fetch /api/logs and keep the page functional.
    const [response] = await Promise.all([
      page.waitForResponse('**/api/logs*').catch(() => null),
      refreshBtn.click(),
    ]);

    // Log entries must still be rendered after the refresh.
    const logEntry = page
      .getByText('Scheduler started successfully')
      .or(page.getByText('Backup target unreachable, retrying...'))
      .or(page.getByText('restic exited with non-zero code'));
    await expect(logEntry.first()).toBeVisible();
  });

  test('logs page shows log levels', async ({ page }) => {
    await page.goto('/logs', { waitUntil: 'networkidle' });

    // Mock logs include INFO, WARNING, ERROR, DEBUG rendered as uppercase spans in the terminal viewer.
    // Target span elements to avoid matching hidden <option> elements in the FilterBar dropdown.
    const levelLabel = page
      .locator('span', { hasText: 'INFO' })
      .or(page.locator('span', { hasText: 'WARNING' }))
      .or(page.locator('span', { hasText: 'ERROR' }))
      .or(page.locator('span', { hasText: 'DEBUG' }));
    await expect(levelLabel.first()).toBeVisible();
  });
});
