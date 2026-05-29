import { useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme, syncThemeFromStorage, toggleTheme } from '../lib/themeStore';

function subscribe(callback) {
  const unsubscribe = subscribeTheme(callback);
  const storageHandler = () => syncThemeFromStorage();
  const eventHandler = () => syncThemeFromStorage();

  window.addEventListener('storage', storageHandler);
  window.addEventListener('portal-tik-theme', eventHandler);

  return () => {
    unsubscribe();
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('portal-tik-theme', eventHandler);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme);
  return { dark: theme === 'dark', toggle: toggleTheme };
}
