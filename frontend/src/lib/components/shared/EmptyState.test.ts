import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import EmptyState from './EmptyState.svelte';

describe('EmptyState', () => {
	it('renders default title when no props provided', () => {
		render(EmptyState);
		expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
	});

	it('renders custom title', () => {
		render(EmptyState, { props: { title: 'No backups found' } });
		expect(screen.getByText('No backups found')).toBeInTheDocument();
	});

	it('renders description when provided', () => {
		render(EmptyState, {
			props: {
				title: 'Empty',
				description: 'Create your first backup to get started',
			},
		});
		expect(screen.getByText('Create your first backup to get started')).toBeInTheDocument();
	});

	it('does not render description when not provided', () => {
		render(EmptyState, { props: { title: 'Empty' } });
		const paragraphs = document.querySelectorAll('p');
		expect(paragraphs.length).toBe(0);
	});

	it('renders action button when actionLabel and onAction are provided', () => {
		const onAction = vi.fn();
		render(EmptyState, {
			props: {
				title: 'Empty',
				actionLabel: 'Create Backup',
				onAction,
			},
		});
		const button = screen.getByText('Create Backup');
		expect(button).toBeInTheDocument();
		expect(button.tagName).toBe('BUTTON');
	});

	it('does not render action button when only actionLabel is provided', () => {
		render(EmptyState, {
			props: {
				title: 'Empty',
				actionLabel: 'Create Backup',
			},
		});
		expect(screen.queryByText('Create Backup')).not.toBeInTheDocument();
	});

	it('calls onAction when button is clicked', async () => {
		const onAction = vi.fn();
		render(EmptyState, {
			props: {
				title: 'Empty',
				actionLabel: 'Create Backup',
				onAction,
			},
		});
		const button = screen.getByText('Create Backup');
		await fireEvent.click(button);
		expect(onAction).toHaveBeenCalledOnce();
	});

	it('renders the SVG icon', () => {
		render(EmptyState);
		const svg = document.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});
});
