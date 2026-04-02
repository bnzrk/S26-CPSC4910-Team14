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

            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['allSponsorOrgs'] });
        },
        retry: 0,
        enabled: isAdmin,
    });
}

export function useSponsorOrg()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    return useQuery({
        queryKey: ["sponsorOrg"],
        queryFn: async () => apiFetch('/sponsor-orgs/me').then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        retry: 1
    });
}

export function useUpdateSponsorOrg()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pointDollarValue }) =>
        {
            const res = await apiFetch('/sponsor-orgs/me', {
                method: 'PATCH',
                body: JSON.stringify({ pointDollarValue }),
            });
            if (!res.ok) throw await res.json();
            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrg'] });
        },
    });
}

export function useSponsorOrgUsers()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgUsers"],
        queryFn: async () => apiFetch('/sponsor-orgs/me/users').then(r => r.json()),
        enabled: !!user && isSponsor,
        retry: 1
    });
}

export function useRemoveSponsorOrgUser()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId }) =>
        {
            const res = await apiFetch(`/sponsor-orgs/me/users/${userId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw await res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgUsers'] });
        },
    });
}

export function useSponsorOrgDrivers()
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgDrivers"],
        queryFn: async () => apiFetch('/sponsor-orgs/me/drivers').then(r => r.json()),
        enabled: !!user && isSponsor,
        placeholderData: keepPreviousData,
        retry: 1
    });
}

export function useSponsorOrgDriver(driverId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;

    return useQuery({
        queryKey: ["sponsorOrgDriver", driverId],
        queryFn: async () => apiFetch(`/sponsor-orgs/me/drivers/${driverId}`).then(r => r.json()),
        enabled: !!user && isSponsor && !!driverId,
        retry: 1
    });
}

export function useRemoveSponsorDriveUser()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ driverId }) =>
        {
            const res = await apiFetch(`/sponsor-orgs/me/drivers/${driverId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw await res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers'] });
        },
    });
}


export function useBulkCreateDriverUsers()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiFetch('/sponsor-orgs/me/drivers/bulk', {
                method: 'POST',
                headers: {},
                body: formData,
            });

            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk create failed' }));
                throw err;
            }

            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers'] });
        },
        retry: 0,
    });
}


export function useBulkUpdateDriverPoints()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiFetch('/sponsor-orgs/me/drivers/bulk-points', {
                method: 'POST',
                headers: {},
                body: formData,
            });

            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk update failed' }));
                throw err;
            }

            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers'] });
        },
        retry: 0,
    });
}


export function useBulkUpdateDriverInfo()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiFetch('/sponsor-orgs/me/drivers/bulk-update', {
                method: 'POST',
                headers: {},
                body: formData,
            });

            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk update failed' }));
                throw err;
            }

            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers'] });
        },
        retry: 0,
    });
}

export function useBulkCreateSponsorUsers()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiFetch('/sponsor-orgs/me/users/bulk', {
                method: 'POST',
                headers: {},
                body: formData,
            });

            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk create failed' }));
                throw err;
            }

            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgUsers'] });
        },
        retry: 0,
    });
}

export function useCreateSponsorOrgUser() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ email, firstName, lastName, password }) => {
        const res = await apiFetch('/sponsor-orgs/me/users', {
          method: 'POST',
          body: JSON.stringify({ email, firstName, lastName, password }),
        });
  
        if (!res.ok) {
          throw await res.json();
        }
  
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sponsorOrgUsers'] });
      },
    });
  }