import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function usePoints()
{
  const { data: user } = useCurrentUser();
  const isDriver = user?.userType === USER_TYPES.DRIVER;

  return useQuery({
    queryKey: ["points", user?.id],
    queryFn: async () => apiFetch('/drivers/points').then(r => r.json()),
    enabled: !!user && isDriver,
    retry: 1
  });
}

export function usePointHistory(page, pageSize)
{
  return useQuery({
    queryKey: ['driverPointTransactions', page, pageSize],
    queryFn: async () =>
      apiFetch(`/drivers/point-transactions?page=${page}&pageSize=${pageSize}`).then(r => r.json()),
    placeholderData: keepPreviousData,
  });
}

export function usePointRules()
{
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['pointRules', user?.id],
    queryFn: async () =>
    {
      const response = await apiFetch(`/sponsor-orgs/point-rules`);
      if (!response.ok) throw new Error('Failed to fetch point rules');
      return response.json();
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreatePointTransaction()
{
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, reason, balanceChange }) =>
    {
      const path = `/drivers${driverId ? `/${driverId}` : ''}/point-transactions`
      const res = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ reason, balanceChange }),
      });

      if (!res.ok)
      {
        throw await res.json();
      }

      return null;
    },
    onSuccess: () =>
    {
      queryClient.invalidateQueries({ queryKey: ["sponsorOrgDriver"] });
    },
    retry: 0
  });
}