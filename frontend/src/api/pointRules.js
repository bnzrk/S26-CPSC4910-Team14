import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function usePointRules(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const orgPath = orgId ?? "me";

    return useQuery({
        queryKey: ['pointRules', orgPath, user?.id],
        queryFn: async () =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgPath}/point-rules`);
            if (!response.ok) throw new Error('Failed to fetch point rules');
            return response.json();
        },
        placeholderData: keepPreviousData,
        enabled: !!user && (isSponsor || isAdmin),
    });
}

export function useCreatePointRule(orgId)
{
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async ({ reason, balanceChange }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgPath}/point-rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason, balanceChange }),
            });
            if (!response.ok) throw new Error('Failed to create point rule');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['pointRules'] });
        },
    });
}

export function useDeletePointRule(orgId)
{
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async ({ id }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgPath}/point-rules/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to delete point rule');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['pointRules'] });
        },
    });
}

export function useUpdatePointRule(orgId)
{
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async ({ id, reason, balanceChange }) =>
        {
            const response = await apiFetch(`/sponsor-orgs/${orgPath}/point-rules/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason, balanceChange}),
            });
            if (!response.ok) throw new Error('Failed to update point rule');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['pointRules'] });
        },
    });
}