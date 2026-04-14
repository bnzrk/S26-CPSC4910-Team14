import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
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
    return useMutation({
        mutationFn: async ({ externalItemId, catalogPrice }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgId}/catalog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ externalItemId, catalogPrice}),
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

export function useUpdateCatalogItem(orgId)
{
    return useMutation({
        mutationFn: async ({ id, price }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgId}/catalog/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ price }),
            });
            if (!response.ok) throw new Error('Failed to update catalog item');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['catalog', orgId] });
        },
    });
}