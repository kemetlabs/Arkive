import type { Page } from '@playwright/test';

/** Mock the setup completion state so pages load normally. */
export async function mockSetupComplete(page: Page, apiKey = 'ark_test1234') {
  await page.route('/api/auth/session', (route) =>
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
}

/** Mock an empty dashboard state. */
export async function mockDashboardData(page: Page) {
  await page.route('/api/jobs/runs?*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    })
  );
  await page.route('/api/storage', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ targets: [], summary: { target_count: 0, total_size_bytes: 0 } }),
    })
  );
  await page.route('/api/jobs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    })
  );
}

/** Mock setup-required state so the app acts like first-run. */
export async function mockSetupRequired(page: Page) {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ setup_required: true }),
    })
  );
  await page.route('**/api/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '3.0.0', status: 'ok', setup_completed: false }),
    })
  );
}

/** Mock the jobs list with sample data. */
export async function mockJobsList(page: Page) {
  await page.route('/api/jobs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'j1', name: 'DB Dumps', type: 'db_dump', schedule: '0 1 * * *', enabled: true },
          { id: 'j2', name: 'Cloud Sync', type: 'full', schedule: '0 2 * * *', enabled: true },
          { id: 'j3', name: 'Flash Backup', type: 'flash', schedule: '0 3 * * *', enabled: true },
        ],
        total: 3,
      }),
    })
  );
}
