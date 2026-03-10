import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SectionCard from './SectionCard.svelte';
import StatCard from './StatCard.svelte';

describe('SectionCard', () => {
	it('renders title and description', () => {
		render(SectionCard, { props: { title: 'Server', description: 'Configure server settings' } });
		expect(screen.getByText('Server')).toBeTruthy();
		expect(screen.getByText('Configure server settings')).toBeTruthy();
	});

	it('applies danger variant border', () => {
		const { container } = render(SectionCard, { props: { title: 'Danger', variant: 'danger' } });
		expect(container.innerHTML).toContain('border-danger');
	});

	it('renders without description when not provided', () => {
		render(SectionCard, { props: { title: 'Only Title' } });
		expect(screen.getByText('Only Title')).toBeTruthy();
	});
});

describe('StatCard', () => {
	it('renders label and value', () => {
		render(StatCard, { props: { label: 'Backups', value: '42' } });
		expect(screen.getByText('Backups')).toBeTruthy();
		expect(screen.getByText('42')).toBeTruthy();
	});

	it('shows positive delta with up arrow', () => {
		render(StatCard, { props: { label: 'X', value: '10', delta: 5 } });
		const el = screen.getByText(/5%/);
		expect(el.className).toContain('text-success');
	});

	it('shows negative delta with down arrow', () => {
		render(StatCard, { props: { label: 'X', value: '10', delta: -3 } });
		const el = screen.getByText(/3%/);
		expect(el.className).toContain('text-danger');
	});

	it('applies font-mono class by default', () => {
		const { container } = render(StatCard, { props: { label: 'X', value: '5' } });
		expect(container.innerHTML).toContain('font-mono');
	});
});
