import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import FormInput from './FormInput.svelte';

describe('FormInput', () => {
	it('renders with label', () => {
		render(FormInput, { props: { id: 'test', label: 'Email', value: '' } });
		expect(screen.getByLabelText('Email')).toBeTruthy();
	});

	it('renders required indicator', () => {
		render(FormInput, { props: { id: 'test', label: 'Name', value: '', required: true } });
		expect(screen.getByText('*')).toBeTruthy();
	});

	it('applies mono class when mono prop is true', () => {
		render(FormInput, { props: { id: 'test', label: 'Code', value: 'abc', mono: true } });
		const input = screen.getByLabelText('Code');
		expect(input.className).toContain('font-mono');
	});

	it('shows hint text', () => {
		render(FormInput, { props: { id: 'test', label: 'X', value: '', hint: 'Help text' } });
		expect(screen.getByText('Help text')).toBeTruthy();
	});

	it('renders disabled input', () => {
		render(FormInput, { props: { id: 'test', label: 'Field', value: '', disabled: true } });
		const input = screen.getByLabelText('Field') as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});
});
