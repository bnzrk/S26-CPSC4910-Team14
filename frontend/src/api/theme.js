// TODO: Backend endpoint needed — PATCH /auth/profile with { theme: 'light' | 'dark' | 'system' }
// Requires User.Theme field to be added to the backend User entity.
// Until then, localStorage is the single source of truth.

const STORAGE_KEY = 'drivepoints-theme';

export async function persistTheme(preference) {
  localStorage.setItem(STORAGE_KEY, preference);
}

export async function fetchUserTheme() {
  return localStorage.getItem(STORAGE_KEY) ?? 'system';
}
