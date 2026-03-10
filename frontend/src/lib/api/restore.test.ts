import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadRestorePlanPdf } from './restore';

describe('restore api', () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	it('downloads the restore plan with cookie credentials instead of query-string auth', async () => {
		const blob = new Blob(['pdf-data'], { type: 'application/pdf' });
		const fetchMock = vi.fn().mockResolvedValue({
			blob: vi.fn().mockResolvedValue(blob),
		});

		vi.stubGlobal('fetch', fetchMock);

		const result = await downloadRestorePlanPdf();

		expect(fetchMock).toHaveBeenCalledWith('/api/restore/plan/pdf', {
			credentials: 'include',
		});
		expect(result).toBe(blob);
	});
});
