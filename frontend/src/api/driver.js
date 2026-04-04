import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useDriverOrgs(driverId)
{
    const { data: user } = useCurrentUser();

    const isDriver = user?.userType === USER_TYPES.DRIVER;

    const driverPath = driverId ?? "me";

    return useQuery({
        queryKey: ["driverOrgs", driverId],
        queryFn: async () => apiFetch(`/drivers/${driverPath}/sponsor-orgs`).then(r => r.json()),
        enabled: !!user && isDriver,
        retry: 1
    });
}

export function useUpdateDriver()
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, email, firstName, lastName }) =>
        {
            const response = await apiFetch(`/drivers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, firstName, lastName }),
            });
            if (!response.ok) throw new Error('Failed to update driver');
        },
        onSettled: (_data, _err, { id }) =>
        {
            queryClient.invalidateQueries({ queryKey: ['sponsorOrgDriver', id] });
            queryClient.invalidateQueries({ queryKey: ['driver', id] });
        },
    });
}

export function useCreateDriverUser(orgId)
{
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    return useMutation({
        mutationFn: async ({ email, username, firstName, lastName, password }) =>
        {
            const res = await apiFetch(`/drivers${orgId ? `?${orgId}` : ''}`, {
                method: "POST",
                body: JSON.stringify({ email, username, firstName, lastName, password }),
            });

            if (!res.ok)
            {
                throw await res.json();
            }

            return null;
        },
        retry: 0,
        enabled: isAdmin,
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}