import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Progress from './Progress.svelte';

describe('Progress', () => {
	it('renders with role progressbar', () => {
		const { container } = render(Progress, { props: { value: 50 } });
		const progressbar = container.querySelector('[role="progressbar"]');
		expect(progressbar).toBeInTheDocument();
	});

	it('renders with correct aria attributes', () => {
		const { container } = render(Progress, { props: { value: 75, max: 100 } });
		const progressbar = container.querySelector('[role="progressbar"]');
		expect(progressbar).toHaveAttribute('aria-valuenow', '75');
		expect(progressbar).toHaveAttribute('aria-valuemin', '0');
		expect(progressbar).toHaveAttribute('aria-valuemax', '100');
	});

	it('renders inner bar with correct width percentage', () => {
		const { container } = render(Progress, { props: { value: 60, max: 100 } });
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 60%');
	});

	it('clamps percentage to 0 when value is negative', () => {
		const { container } = render(Progress, { props: { value: -10, max: 100 } });
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 0%');
	});

	it('clamps percentage to 100 when value exceeds max', () => {
		const { container } = render(Progress, { props: { value: 150, max: 100 } });
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 100%');
	});

	it('calculates percentage correctly with custom max', () => {
		const { container } = render(Progress, { props: { value: 25, max: 50 } });
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 50%');
	});

	it('defaults to 0 value and 100 max', () => {
		const { container } = render(Progress);
		const progressbar = container.querySelector('[role="progressbar"]');
		expect(progressbar).toHaveAttribute('aria-valuenow', '0');
		expect(progressbar).toHaveAttribute('aria-valuemax', '100');
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 0%');
	});

	it('renders with full width at 100%', () => {
		const { container } = render(Progress, { props: { value: 100, max: 100 } });
		const innerBar = container.querySelector('[role="progressbar"] > div');
		expect(innerBar).toHaveStyle('width: 100%');
	});
});
