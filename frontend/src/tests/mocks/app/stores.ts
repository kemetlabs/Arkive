import { writable, readable } from 'svelte/store';

export const page = readable({
	url: new URL('http://localhost'),
	params: {},
});

export const navigating = readable(null);
