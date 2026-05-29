const THEME_KEY = 'portal_tik_theme';
const listeners = new Set();

function readTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    return stored;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let currentTheme = readTheme();

function emit() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new CustomEvent('portal-tik-theme'));
}

export function getTheme() {
  return currentTheme;
}

export function setTheme(nextTheme) {
  currentTheme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  emit();
}

export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function syncThemeFromStorage() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && stored !== currentTheme) {
    currentTheme = stored;
    listeners.forEach((listener) => listener());
  }
}
