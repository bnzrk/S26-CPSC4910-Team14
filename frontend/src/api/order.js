import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function useOrders({ driverId, orgId })
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    const params = new URLSearchParams();
    if (driverId)
        params.append("driverId", driverId);
    if (orgId)
        params.append("orgId", orgId);

    return useQuery({
        queryKey: ["orders", driverId, orgId],
        queryFn: async () => apiFetch(`/orders?${params.toString()}`).then(r => r.json()),
        enabled: !!user && (!!driverId || (isDriver && !driverId)),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}