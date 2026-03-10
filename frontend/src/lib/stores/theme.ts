import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

function createThemeStore() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('arkive_theme') as Theme : null;
  const { subscribe, set, update } = writable<Theme>(stored || 'dark');

  return {
    subscribe,
    set: (value: Theme) => {
      if (typeof localStorage !== 'undefined') localStorage.setItem('arkive_theme', value);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', value === 'dark');
        document.documentElement.classList.toggle('light', value === 'light');
      }
      set(value);
    },
    toggle: () => {
      update(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (typeof localStorage !== 'undefined') localStorage.setItem('arkive_theme', next);
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark');
          document.documentElement.classList.toggle('light', next === 'light');
        }
        return next;
      });
    },
  };
}

export const theme = createThemeStore();
