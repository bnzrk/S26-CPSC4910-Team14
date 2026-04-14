import { apiFetch } from './apiFetch';

export async function fetchDriverPointsHistory(driverId) {
  const params = new URLSearchParams();
  if (driverId) params.set('driverId', driverId);

  const response = await apiFetch(`/audit-logs/driver-points-history?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch driver points history');
  return response.json();
}