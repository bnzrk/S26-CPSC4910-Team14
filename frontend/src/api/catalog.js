import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
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

export function useAddCatalogItem(orgId)
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ externalItemId, price }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgId}/catalog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ externalItemId, price}),
            });
            if (!response.ok) throw new Error('Failed to delete catalog item');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['catalog', orgId] });
        },
    });
}

export function useRemoveCatalogItem(orgId)
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgId}/catalog/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to delete catalog item');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['catalog', orgId] });
        },
    });
}