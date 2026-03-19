import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";

export function useCatalog(orgId)
{
    const { data: user } = useCurrentUser();

    return useQuery({
        queryKey: ["catalog", orgId],
        queryFn: async () => apiFetch(`/sponsor-orgs/${orgId}/catalog`).then(r => r.json()),
        enabled: !!user && !!orgId,
        retry: 1,
        placeholderData: keepPreviousData,
    });
}