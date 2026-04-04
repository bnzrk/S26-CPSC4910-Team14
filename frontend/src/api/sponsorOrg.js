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
        queryFn: async () => apiFetch('/sponsor-orgs').then(r => r.json()),
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

export function useSponsorOrg(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const orgPath = orgId ?? "me";

    return useQuery({
        queryKey: ["sponsorOrg", orgPath, user?.id],
        queryFn: async () => apiFetch(`/sponsor-orgs/${orgPath}`).then(r => r.json()),
        enabled: !!user && (isSponsor || (isAdmin && !!orgId)), 
        retry: 1
    });
}

export function useSponsorOrgUsers(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const orgPath = orgId ?? "me";

    return useQuery({
        queryKey: ["sponsorOrgUsers", user?.id],
        queryFn: async () => apiFetch(`/sponsor-orgs/${orgPath}/users`).then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        placeholderData: keepPreviousData,
    });
}

export function useSponsorOrgDrivers(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const orgPath = orgId ?? "me";

    return useQuery({
        queryKey: ["sponsorOrgDrivers", user?.id],
        queryFn: async () => apiFetch(`/sponsor-orgs/${orgPath}/drivers`).then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        placeholderData: keepPreviousData,
    });
}

export function useRemoveSponsorDriveUser(orgId)
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async (id) =>
        {
            const res = await apiFetch(`/sponsor-orgs/${orgPath}/drivers/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to remove driver');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers', user?.id] });
        },
        retry: 0,
    });
}

export function useSponsorOrgDriver({ orgId, driverId })
{
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();

    const orgPath = orgId ?? "me";

    return useQuery({
        queryKey: ["sponsorOrgDriver", driverId],
        queryFn: async () =>
        {
            const res = await apiFetch(`/sponsor-orgs/${orgPath}/drivers/${driverId}`);

            if (!res.ok)
            {
                const err = new Error(res.status === 404 ? "Driver not found" : "Could not fetch driver");
                err.status = res.status;
                throw err;
            }

            return res.json();
        },
        enabled: !!user && driverId != null,
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

export function useCreateSponsorOrgUser(orgId)
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async ({ email, username, firstName, lastName, password }) =>
        {
            const path = `/sponsor-orgs/${orgPath}/users`;
            const res = await apiFetch(path, {
                method: "POST",
                body: JSON.stringify({ email, username, firstName, lastName, password }),
            });

            if (!res.ok)
                throw await res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["sponsorOrgUsers", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        retry: 0
    });
}

export function useRemoveSponsorOrgUser(orgId)
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async (sponsorUserId) =>
        {
            const res = await apiFetch(`/sponsor-orgs/${orgPath}/users/${sponsorUserId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to remove employee');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgUsers', user?.id] });
        },
        retry: 0,
    });
}

export function useUpdateSponsorOrg(orgId)
{
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();
    const orgPath = orgId ?? "me";

    return useMutation({
        mutationFn: async ({ sponsorName, pointRatio }) =>
        {
            return apiFetch(`/sponsor-orgs/${orgPath}`, {
                method: "PATCH",
                body: JSON.stringify({ sponsorName, pointRatio }),
            });
        },

        onMutate: async ({ sponsorName, pointRatio }) =>
        {
            const queryKey = ["sponsorOrg", orgPath, user?.id];

            await queryClient.cancelQueries({ queryKey });

            const previousOrg = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) =>
            {
                if (!old) return old;
                return { ...old, ...{ sponsorName }, ...{ pointRatio } };
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