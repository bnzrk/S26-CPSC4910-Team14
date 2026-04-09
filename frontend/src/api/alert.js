import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function useAlerts()
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    return useQuery({
        queryKey: ["alerts", user?.id],
        queryFn: async () => apiFetch(`/alerts`).then(r => r.json()),
        enabled: !!user && isDriver,
        retry: 0,
        refetchInterval: 1000 * 60 * 10 // Poll every 10 minutes
    });
}