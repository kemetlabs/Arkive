import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CronEditor from './CronEditor.svelte';

// Mock the API module before importing the component
vi.mock('$lib/api/schedule', () => ({
	getCronPreview: vi.fn().mockResolvedValue({ next_runs: [] }),
}));

describe('CronEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders with default label', () => {
		render(CronEditor);
		expect(screen.getByText('Schedule')).toBeInTheDocument();
	});

	it('renders with custom label', () => {
		render(CronEditor, { props: { label: 'Backup Schedule' } });
		expect(screen.getByText('Backup Schedule')).toBeInTheDocument();
	});

	it('renders cron input field with default value', () => {
		render(CronEditor);
		const input = screen.getByPlaceholderText('* * * * *') as HTMLInputElement;
		expect(input).toBeInTheDocument();
		expect(input.value).toBe('0 7 * * *');
	});

	it('renders all preset buttons', () => {
		render(CronEditor);
		expect(screen.getByText('Every 6 hours')).toBeInTheDocument();
		expect(screen.getByText('Every 12 hours')).toBeInTheDocument();
		expect(screen.getByText('Daily at 3 AM')).toBeInTheDocument();
		expect(screen.getByText('Daily at 7 AM')).toBeInTheDocument();
		expect(screen.getByText('Weekly (Sunday)')).toBeInTheDocument();
	});

	it('updates input value when preset is clicked', async () => {
		render(CronEditor);
		const input = screen.getByPlaceholderText('* * * * *') as HTMLInputElement;

		// Default value is '0 7 * * *'
		expect(input.value).toBe('0 7 * * *');

		const presetButton = screen.getByText('Every 6 hours');
		await fireEvent.click(presetButton);

		// After clicking preset, input value should update
		expect(input.value).toBe('0 */6 * * *');
	});

	it('updates input value when a different preset is clicked', async () => {
		render(CronEditor);
		const input = screen.getByPlaceholderText('* * * * *') as HTMLInputElement;

		const presetButton = screen.getByText('Weekly (Sunday)');
		await fireEvent.click(presetButton);

		expect(input.value).toBe('0 3 * * 0');
	});

	it('renders with custom initial value', () => {
		render(CronEditor, { props: { value: '0 */12 * * *' } });
		const input = screen.getByPlaceholderText('* * * * *') as HTMLInputElement;
		expect(input.value).toBe('0 */12 * * *');
	});
});
