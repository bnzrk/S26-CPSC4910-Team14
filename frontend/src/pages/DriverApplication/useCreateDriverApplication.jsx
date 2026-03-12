import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/api/apiFetch';

export function useCreateDriverApplication() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiFetch('/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      return response.json();
    }
  });
}