import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function useOrder(orderId)
{
    const { data: user } = useCurrentUser();

    return useQuery({
        queryKey: ["orders", orderId],
        queryFn: async () => apiFetch(`/orders/${orderId}`).then(r => r.json()),
        enabled: !!user && !!orderId,
        retry: 1
    });
}

export function useCreateOrder({ driverId, catalogId, catalogItemIds })
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ externalItemId, catalogPrice, catalogItemIds }) =>
        {
            const response = await apiFetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ externalItemId, catalogPrice, catalogItemIds }),
            });
            if (!response.ok) throw new Error('Failed to create order');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
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