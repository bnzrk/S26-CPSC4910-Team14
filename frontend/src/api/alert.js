import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useCurrentUser } from "./currentUser";
import { USER_TYPES } from "@/constants/userTypes";
import { apiFetch } from "./apiFetch";

export function useAlerts()
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    return useQuery({
        queryKey: ["alerts", user?.id],
        queryFn: async () => apiFetch(`/alerts`).then(r => r.json()),
        enabled: !!user && isDriver,
        retry: 0,
        refetchInterval: 1000 * 60 * 10 // Poll every 10 minutes
    });
}

export function useAlertSettings()
{
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    return useQuery({
        queryKey: ["alertSettings", user?.id],
        queryFn: async () => apiFetch(`/alerts/settings`).then(r => r.json()),
        enabled: !!user && isDriver,
        retry: 0
    });
}

export function useUpdateAlertSettings()
{
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: async (settings) =>
            apiFetch(`/alerts/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            }).then(r =>
            {
                if (!r.ok) throw new Error("Failed to update alert settings");
            }),

        onMutate: async (newSettings) =>
        {
            const queryKey = ["alertSettings", user?.id];

            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, newSettings);

            return { previous };
        },

        onError: (_err, _newSettings, context) =>
        {
            if (context?.previous)
            {
                queryClient.setQueryData(["alertSettings", user?.id], context.previous);
            }
        },

        onSettled: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["alertSettings", user?.id] });
        },
    });
}

export function useDismissAlert()
{
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: async ({ alertId, alertType }) =>
        {
            const params = new URLSearchParams();
            params.append("alertType", alertType);
            const response = await apiFetch(`/alerts/${alertId}?${params.toString()}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to dismiss alert.');
        },
        onMutate: async ({ alertId, alertType }) =>
        {
            const queryKey = ["alerts", user?.id];

            // Cancel any outgoing refetches to avoid overwriting the optimistic update
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value for rollback
            const previousAlerts = queryClient.getQueryData(queryKey);

            // Optimistically remove the alert from the cache
            queryClient.setQueryData(queryKey, (old) =>
                old?.filter((alert) => !(alert.id == alertId && alert.type == alertType))
            );

            return { previousAlerts };
        },
        onError: (err, variables, context) =>
        {
            queryClient.setQueryData(["alerts", user?.id], context.previousAlerts);
        },
        onSettled: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
        },
    });
}

export function useDismissAllAlerts()
{
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: async () =>
        {
            const response = await apiFetch(`/alerts/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to dismiss alerts.');
        },
        onMutate: async () =>
        {
            const queryKey = ["alerts", user?.id];

            // Cancel any outgoing refetches to avoid overwriting the optimistic update
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous cache for rollback
            const previousAlerts = queryClient.getQueryData(queryKey);

            // Optimistically empty cache
            queryClient.setQueryData(queryKey, []);

            return { previousAlerts };
        },
        onError: (err, variables, context) =>
        {
            queryClient.setQueryData(["alerts", user?.id], context.previousAlerts);
        },
        onSettled: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
        },
    });
}