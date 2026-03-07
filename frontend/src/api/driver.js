import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useDriverOrg()
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    return useQuery({
        queryKey: ["driverOrg", user?.id],
        queryFn: async () => apiFetch('/drivers/sponsor-org').then(r => r.json()),
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