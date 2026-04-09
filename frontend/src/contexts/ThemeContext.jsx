import { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './themeContextValue';
import { useCurrentUser } from '../api/currentUser';

const LAST_USER_KEY = 'drivepoints-last-user';
const getStorageKey = (id) => `drivepoints-theme-${id}`;

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

function getPreferenceForUser(id) {
  const stored = localStorage.getItem(getStorageKey(id));
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

export default function ThemeProvider({ children }) {
  const { data: user, isLoading } = useCurrentUser();
  const userId = user?.id ?? null;

  const [themePreference, setThemePreferenceState] = useState('system');
  // Init resolvedTheme from what FOUC script already applied — prevents double-flash
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const fouc = document.documentElement.getAttribute('data-theme');
    return fouc === 'dark' ? 'dark' : 'light';
  });

  const applyTheme = useCallback((resolved) => {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');
    html.setAttribute('data-theme', resolved);
    setTimeout(() => html.classList.remove('theme-transitioning'), 200);
  }, []);

  // Sync theme when auth state resolves or user changes
  useEffect(() => {
    if (isLoading) return;
    if (!userId) {
      // Not logged in: always light
      setThemePreferenceState('light');
      setResolvedTheme('light');
      applyTheme('light');
    } else {
      // Logged in: use this user's preference
      localStorage.setItem(LAST_USER_KEY, userId);
      const pref = getPreferenceForUser(userId);
      const resolved = resolveTheme(pref);
      setThemePreferenceState(pref);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  }, [userId, isLoading, applyTheme]);

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

  const setThemePreference = useCallback((preference) => {
    if (!userId) return; // no-op on public pages
    setThemePreferenceState(preference);
    localStorage.setItem(getStorageKey(userId), preference);
    const resolved = resolveTheme(preference);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [userId, applyTheme]);

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
