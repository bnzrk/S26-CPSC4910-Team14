import { useQuery } from '@tanstack/react-query';
import { fetchAboutInfo } from '../../../api/about';

export function useAboutData() {
  return useQuery({
    queryKey: ['about'],
    queryFn: fetchAboutInfo,
    staleTime: 5 * 60 * 1000,
  });
}
