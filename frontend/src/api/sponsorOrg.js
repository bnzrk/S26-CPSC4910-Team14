import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useAllSponsorOrgs()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    return useQuery({
        queryKey: ["allSponsorOrgs"],
        queryFn: async () => apiFetch('/sponsor-orgs/all').then(r => r.json()),
        enabled: !!user && isAdmin,
        retry: 1
    });
}

export function useCreateSponsorOrg()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sponsorName }) =>
        {
            const res = await apiFetch("/sponsor-orgs", {
                method: "POST",
                body: JSON.stringify({ sponsorName }),
            });

            if (!res.ok)
            {
                throw await res.json();
            }

            return null;
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["allSponsorOrgs"] });
        },
        retry: 0,
        enabled: !!user && isAdmin,
    });
}

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

export function useSponsorOrgDrivers()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgDrivers", user?.id],
        queryFn: async () => apiFetch('/sponsor-orgs/drivers').then(r => r.json()),
        enabled: !!user && isSponsor,
        placeholderData: keepPreviousData,
    });
}

export function useSponsorOrgDriver(driverId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgDriver", user?.id, driverId],
        queryFn: async () =>
        {
            const res = await apiFetch(`/sponsor-orgs/drivers/${driverId}`);

            if (!res.ok)
            {
                const err = new Error(res.status === 404 ? "Driver not found" : "Could not fetch driver");
                err.status = res.status;
                throw err;
            }

            return res.json();
        },
        enabled: !!user && isSponsor && driverId != null,
        retry: (failureCount, error) =>
        {
            if (error?.status === 404 || error?.status === 401 || error?.status === 403)
            {
                return false;
            }
            return failureCount < 2;
        },
    });
}

export function useCreateSponsorOrgUser()
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orgId, email, username, firstName, lastName, password }) =>
        {
            const path = `/sponsor-orgs${orgId ? `/${orgId}` : ''}/users`;
            const res = await apiFetch(path, {
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
