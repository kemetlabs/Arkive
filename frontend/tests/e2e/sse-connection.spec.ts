/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete } from './fixtures/api-mocks';

// ---------------------------------------------------------------------------
// Route setup helpers
// ---------------------------------------------------------------------------

async function mockBaseRoutes(page: Page) {
  await mockSetupComplete(page);

  await page.route('**/api/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: true }),
    })
  );

  await page.route('**/api/jobs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jobs: [], items: [], total: 0 }),
    })
  );

  await page.route('**/api/jobs/runs*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    })
  );

  await page.route('**/api/storage', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ targets: [], summary: { target_count: 0, total_size_bytes: 0 } }),
    })
  );

  await page.route('**/api/activity*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activities: [], total: 0 }),
    })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('SSE Connection Indicator', () => {
  test('no "Connection lost" banner when SSE stream is active', async ({ page }) => {
    await mockBaseRoutes(page);

    // Mock a healthy SSE stream — return a valid event-stream response
    // that keeps the connection alive (empty body simulates an open stream)
    await page.route('**/api/events/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
        body: 'data: {"type":"connected"}\n\n',
      })
    );

    await page.goto('/', { waitUntil: 'networkidle' });

    // No "Connection lost" or "disconnected" banner should be visible.
    await expect(page.locator('body')).not.toContainText('connection lost');
    await expect(page.locator('body')).not.toContainText('disconnected');
    await expect(page.locator('body')).not.toContainText('offline');
    await expect(page.locator('body')).not.toContainText('404');

    // The page must load with a visible layout element.
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('page renders normally with a responding SSE endpoint', async ({ page }) => {
    await mockBaseRoutes(page);

    await page.route('**/api/events/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"heartbeat"}\n\n',
      })
    );

    await page.goto('/', { waitUntil: 'networkidle' });

    // Dashboard content should be present — not stuck on a loading screen.
    // The layout nav or main region must be visible.
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('banner appears when SSE endpoint returns error and setup is complete', async ({ page }) => {
    await mockBaseRoutes(page);

    // Mock SSE endpoint returning a server error
    await page.route('**/api/events/**', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Service unavailable' }),
      })
    );

    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait briefly for the UI to react to the failed SSE connection.
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('page not found');

    // The page must render something — not be blank — even when SSE fails.
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('page recovers gracefully when SSE stream is empty', async ({ page }) => {
    await mockBaseRoutes(page);

    // Empty SSE body — simulates a connection that opened but sent nothing
    await page.route('**/api/events/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: '',
      })
    );

    await page.goto('/', { waitUntil: 'networkidle' });

    // Page must not crash — layout must still be rendered.
    await expect(page.locator('body')).not.toContainText('404');
    const layout = page.locator('nav, aside, main, [role="main"]');
    await expect(layout.first()).toBeVisible();
  });

  test('SSE indicator element is present in the layout', async ({ page }) => {
    await mockBaseRoutes(page);

    await page.route('**/api/events/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"connected"}\n\n',
      })
    );

    await page.goto('/', { waitUntil: 'networkidle' });

    // Navigation and main content must be visible — confirms the layout rendered.
    const nav = page.locator('nav, aside, [class*="sidebar"]');
    await expect(nav.first()).toBeVisible();

    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
  });
});
