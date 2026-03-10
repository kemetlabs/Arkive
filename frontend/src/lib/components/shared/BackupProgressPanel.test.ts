import { render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BackupProgressPanel from './BackupProgressPanel.svelte';
import { backupRunning } from '$lib/stores/app';

const mocks = vi.hoisted(() => ({
	listRuns: vi.fn(),
	subscribe: vi.fn(() => () => {}),
}));

vi.mock('$lib/api/backup', () => ({
	backupApi: {
		listRuns: mocks.listRuns,
	},
}));

vi.mock('$lib/stores/sse', () => ({
	subscribe: mocks.subscribe,
}));

describe('BackupProgressPanel', () => {
	beforeEach(() => {
		mocks.listRuns.mockReset();
		mocks.subscribe.mockClear();
		sessionStorage.clear();
		backupRunning.set(false);
	});

	it('rehydrates visible running progress after refresh when a run is still active', async () => {
		sessionStorage.setItem(
			'arkive_backup_progress',
			JSON.stringify({
				runId: 'run-1',
				visible: true,
				currentPhaseIndex: 2,
				percent: 50,
				status: 'running',
				errorMessage: '',
				updatedAt: new Date().toISOString(),
			}),
		);
		mocks.listRuns.mockResolvedValue({
			items: [{ id: 'run-1', status: 'running' }],
			total: 1,
		});

		const { container } = render(BackupProgressPanel);

		await waitFor(() => {
			expect(screen.getByText('Backup Progress')).toBeInTheDocument();
		});

		expect(get(backupRunning)).toBe(true);
		expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '50');
	});

	it('clears stale running state when no active run exists after refresh', async () => {
		sessionStorage.setItem(
			'arkive_backup_progress',
			JSON.stringify({
				runId: 'run-1',
				visible: true,
				currentPhaseIndex: 1,
				percent: 25,
				status: 'running',
				errorMessage: '',
				updatedAt: new Date().toISOString(),
			}),
		);
		mocks.listRuns.mockResolvedValue({
			items: [],
			total: 0,
		});

		const { container } = render(BackupProgressPanel);

		await waitFor(() => {
			expect(get(backupRunning)).toBe(false);
		});

		expect(sessionStorage.getItem('arkive_backup_progress')).toBeNull();
		expect(container.querySelector('[role="progressbar"]')).toBeNull();
	});
});
