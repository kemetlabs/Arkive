import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects to /setup when setup has not been completed', async ({ page }) => {
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ setup_required: true, authenticated: false }),
      })
    );
    await page.route('**/api/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: false }),
      })
    );
    await page.route('**/api/events/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
    );
    await page.goto('/');
    await expect(page).toHaveURL(/setup/);
  });

  test('redirects to /login when setup is complete but no browser session exists', async ({ page }) => {
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          setup_required: false,
          authenticated: false,
          setup_completed_at: '2026-03-06T00:00:00Z',
        }),
      })
    );
    await page.route('**/api/events/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
    );

    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('loads dashboard when authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          setup_required: false,
          authenticated: true,
          setup_completed_at: '2026-03-06T00:00:00Z',
        }),
      })
    );
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
    await page.route('**/api/**', (route) => {
      if (route.request().url().includes('/status') || route.request().url().includes('/session') || route.request().url().includes('/events'))
        return;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto('/');
    // Should not redirect to setup
    await expect(page).not.toHaveURL(/setup/);
    await expect(page).not.toHaveURL(/login/);
  });
});
