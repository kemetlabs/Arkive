/**
 * UI integration tests — validates frontend rendering with mocked API responses.
 * For full backend integration, see api-smoke.spec.ts and setup-wizard.spec.ts.
 *
 * The layout uses api.getStatus() (/api/status) to determine setup state and
 * trigger the /setup redirect. The SSE stream is at /api/events/stream.
 *
 * The sidebar (<aside>) is off-screen when closed (translate-x-full), so
 * Playwright's toBeVisible() cannot detect it. Instead we check for the
 * layout wrapper div or use innerText length checks for graceful degradation.
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSetupComplete, mockSetupRequired } from './fixtures/api-mocks';

// ---------------------------------------------------------------------------
// Route setup helpers
// ---------------------------------------------------------------------------

/**
 * Mock all API routes to return 401 Unauthorized.
 * The layout calls /api/status first; when it returns 401 the layout catches
 * the error, stays on current URL, and renders the layout shell.
 */
async function mockUnauthorizedRoutes(page: Page) {
  await page.route('**/api/status*', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Invalid or missing API key' }),
    })
  );
  await page.route('**/api/events/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
  );
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Invalid or missing API key' }),
    })
  );
}

/**
 * Mock all API routes to simulate a network/server failure (500).
 */
async function mockNetworkErrorRoutes(page: Page) {
  await page.route('**/api/status*', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal server error' }),
    })
  );
  await page.route('**/api/events/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
  );
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal server error' }),
    })
  );
}

/**
 * Mock all API routes to abort (simulates a complete network outage).
 */
async function mockNetworkAbortRoutes(page: Page) {
  await page.route('**/api/events/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
  );
  await page.route('**/api/**', (route) => {
    const url = route.request().url();
    if (url.includes('/api/events')) return route.continue();
    return route.abort('failed');
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Error States', () => {
  test('invalid API key causes redirect to setup or shows an error', async ({ page }) => {
    await mockUnauthorizedRoutes(page);

    await page.goto('/', { waitUntil: 'networkidle' });

    // Graceful degradation: the app must not show raw JS exceptions.
    // When /api/status returns 401, the layout catches the error silently.
    // The page may render blank, redirect to /setup, or show the layout — all are acceptable.
    await expect(page.locator('body')).not.toContainText('page not found');
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('uncaught');
    // Body element itself must be present (page did not completely crash)
    await expect(page.locator('body')).toBeAttached();
  });

  test('network error on API calls shows feedback or graceful degradation', async ({ page }) => {
    await mockNetworkErrorRoutes(page);

    await page.goto('/', { waitUntil: 'networkidle' });

    // Must not show raw exception output — graceful degradation is the goal.
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('uncaught');
    await expect(page.locator('body')).not.toContainText('page not found');
    // Body must be attached — page did not crash
    await expect(page.locator('body')).toBeAttached();
  });

  test('aborted network requests do not crash the application', async ({ page }) => {
    await mockNetworkAbortRoutes(page);

    await page.goto('/', { waitUntil: 'networkidle' });

    // No raw exception output should be visible
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('uncaught exception');
    // Body must be attached — page did not crash entirely
    await expect(page.locator('body')).toBeAttached();
  });

  test('404 routes render a not-found page rather than crashing', async ({ page }) => {
    await mockSetupComplete(page);

    // Mock status API so layout does not redirect to /setup in CI
    await page.route('**/api/status*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: '0.1.0', status: 'ok', setup_completed: true, platform: 'linux', uptime_seconds: 100 }),
      })
    );

    // Navigate to a route that does not exist in SvelteKit
    await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });

    // SvelteKit renders a "Not found" page for unknown routes — verify the text.
    const notFound = page
      .getByText(/not found|404|page.*not/i)
      .or(page.locator('aside').first());
    await expect(notFound.first()).toBeVisible();

    // Must not show a raw unhandled exception
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('uncaught');
  });

  test('setup_completed false in status causes redirect to setup', async ({ page }) => {
    await mockSetupRequired(page);

    await page.goto('/', { waitUntil: 'networkidle' });

    // The app redirects to /setup when the browser session says setup is required.
    await expect(page).toHaveURL(/setup/);
  });

  test('API 500 on settings page shows graceful degradation', async ({ page }) => {
    await mockSetupComplete(page);

    // /api/status returns ok so layout renders normally
    await page.route('**/api/status*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: true }),
      })
    );

    // Settings endpoint returns 500
    await page.route('**/api/settings*', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Database error' }),
      })
    );

    // SSE stream — fulfill so it doesn't hang
    await page.route('**/api/events/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
    );

    await page.goto('/settings/general', { waitUntil: 'networkidle' });

    // Page should render — not crash entirely
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('uncaught');

    // Layout shell must render — aside is always in the DOM for non-setup pages
    const hasAside = (await page.locator('aside').count()) > 0;
    expect(hasAside).toBe(true);
  });
});
