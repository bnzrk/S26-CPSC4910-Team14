import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useSponsorOrg()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrg", user?.id],
        queryFn: async () => apiFetch('/sponsor-orgs').then(r => r.json()),
        enabled: !!user && isSponsor,
        retry: 1
    });
}

export function useSponsorOrgUsers()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgUsers", user?.id],
        queryFn: async () => apiFetch('/sponsor-orgs/users').then(r => r.json()),
        enabled: !!user && isSponsor,
        placeholderData: keepPreviousData,
    });
}

export function useCreateSponsorOrgUser()
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, username, firstName, lastName, password }) =>
        {
            const res = await apiFetch("/sponsor-orgs/sponsors", {
                method: "POST",
                body: JSON.stringify({ email, username, firstName, lastName, password }),
            });

            if (!res.ok)
            {
                throw await res.json();
            }

            return null;
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["sponsorOrgUsers", user?.id] });
        },
        retry: 0
    });
}

export function useRenameSponsorOrg()
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name }) =>
        {
            return apiFetch("/sponsor-orgs/rename", {
                method: "PATCH",
                body: JSON.stringify({ sponsorName: name }),
            });
        },

        onMutate: async ({ name }) =>
        {
            const queryKey = ["sponsorOrg", user?.id];

            await queryClient.cancelQueries({ queryKey });

            const previousOrg = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) =>
            {
                if (!old) return old;
                return { ...old, sponsorName: name };
            });

            return { previousOrg, queryKey };
        },

        onError: (_err, _vars, ctx) =>
        {
            if (ctx?.previousOrg)
            {
                queryClient.setQueryData(ctx.queryKey, ctx.previousOrg);
            }
        },
    });
}
