import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function usePoints(orgId)
{
  const { data: user } = useCurrentUser();
  const isDriver = user?.userType === USER_TYPES.DRIVER;

  return useQuery({
    queryKey: ["points", user?.id, orgId],
    queryFn: async () => apiFetch(`/drivers/me/points/${orgId}`).then(r => r.json()),
    enabled: !!user && !!orgId && isDriver,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

  export function usePointHistory({ orgId, page, pageSize, sign, from, to })
  {
    return useQuery({
      queryKey: ['pointTransactions', orgId, page, pageSize, sign, from, to],
      queryFn: async () =>
      {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (orgId) params.append('orgId', orgId);
        if (sign) params.append('sign', sign);
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const res = await apiFetch(`/drivers/me/point-transactions?${params.toString()}`);
        return res.json();
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