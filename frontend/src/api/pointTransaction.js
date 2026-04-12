import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function usePointTransactions({ driverId, to, from, page = 1, pageSize = 10 })
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    const params = new URLSearchParams();
    if (driverId)
        params.append("driverId", driverId);
    if (to)
        params.append("to", to);
    if (from)
        params.append("from", from);
    params.append("page", page);
    params.append("pageSize", pageSize);

    return useQuery({
        queryKey: ["pointTransactions", user?.id, driverId, to, from, page, pageSize],
        queryFn: async () => apiFetch(`/point-transactions?${params.toString()}`).then(r => r.json()),
        enabled: !!user && isSponsor,
        placeholderData: keepPreviousData,
        retry: 0
    });
}