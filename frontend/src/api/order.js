import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function useOrder(orderId)
{
    const { data: user } = useCurrentUser();

    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => apiFetch(`/orders/${orderId}`).then(r => r.json()),
        enabled: !!user && !!orderId,
        retry: 1
    });
}

export function useCreateOrder()
{
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: async ({ driverId, catalogId, catalogItemIds }) =>
        {
            const response = await apiFetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ driverId, catalogId, catalogItemIds }),
            });
            if (!response.ok)
            {
                const json = await response.json();
                throw new Error(json?.error ?? 'Failed to create order');
            }
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
        },
    });
}

export function useCancelOrder()
{
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: async ({ orderId }) =>
        {
            const response = await apiFetch(`/orders/${orderId}/cancel`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to cancel order');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['order'] });
        },
    });
}

export function useOrders({ driverId, orgId, type, page, pageSize })
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    const params = new URLSearchParams();
    if (driverId)
        params.append("driverId", driverId);
    if (orgId)
        params.append("orgId", orgId);
    if (type)
        params.append("type", type);
    if (page)
        params.append("page", page);
    if (pageSize)
        params.append("pageSize", pageSize);

    return useQuery({
        queryKey: ["orders", driverId, orgId, type, page, pageSize],
        queryFn: async () => apiFetch(`/orders?${params.toString()}`).then(r => r.json()),
        enabled: !!user && (!!driverId || (isDriver && !driverId)),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}