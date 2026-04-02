import { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './themeContextValue';

const STORAGE_KEY = 'drivepoints-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

export default function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(getStoredPreference);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredPreference()));

  const applyTheme = useCallback((resolved) => {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');
    html.setAttribute('data-theme', resolved);
    setTimeout(() => html.classList.remove('theme-transitioning'), 200);
  }, []);

  const setThemePreference = useCallback((preference) => {
    setThemePreferenceState(preference);
    localStorage.setItem(STORAGE_KEY, preference);
    const resolved = resolveTheme(preference);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    // TODO: Persist to backend once User.Theme field is added
    // PATCH /auth/profile { theme: preference }
  }, [applyTheme]);

  // Listen for OS theme changes when preference is 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange() {
      if (themePreference === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    }
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [themePreference, applyTheme]);

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
