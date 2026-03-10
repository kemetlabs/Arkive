import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ModalShell from './ModalShell.svelte';

describe('ModalShell', () => {
	it('does not render dialog when closed', () => {
		const { container } = render(ModalShell, { props: { open: false, title: 'Test' } });
		expect(container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('renders dialog when open', () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		expect(container.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('renders title when open', () => {
		render(ModalShell, { props: { open: true, title: 'Confirm Action' } });
		expect(screen.getByText('Confirm Action')).toBeTruthy();
	});

	it('has aria-modal attribute set to true', () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
	});

	it('has aria-labelledby referencing modal-title', () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog?.getAttribute('aria-labelledby')).toBe('modal-title');
	});

	it('has close button with aria-label', () => {
		render(ModalShell, { props: { open: true, title: 'Test' } });
		expect(screen.getByLabelText('Close modal')).toBeTruthy();
	});

	it('closes when close button is clicked', async () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		const closeBtn = screen.getByLabelText('Close modal');
		await fireEvent.click(closeBtn);
		await waitFor(() => {
			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	it('closes on Escape key press', async () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		await fireEvent.keyDown(window, { key: 'Escape' });
		await waitFor(() => {
			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	it('does not close on Escape when closeOnEscape is false', async () => {
		const { container } = render(ModalShell, {
			props: { open: true, title: 'Test', closeOnEscape: false },
		});
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(container.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('applies animate-modal-in class to inner panel', () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test' } });
		const panel = container.querySelector('.animate-modal-in');
		expect(panel).toBeTruthy();
	});

	it('applies danger border class when danger prop is true', () => {
		const { container } = render(ModalShell, { props: { open: true, title: 'Test', danger: true } });
		const panel = container.querySelector('.border-danger\\/40');
		expect(panel).toBeTruthy();
	});
});
