import { API_URL } from '../config';

export async function fetchAboutInfo() {
  const response = await fetch(`${API_URL}/about`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
