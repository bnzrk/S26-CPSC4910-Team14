import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useSales({ orgId, driverId, to, from, page = 1, pageSize = 10 })
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const params = new URLSearchParams();
    if (orgId)
        params.append("orgId", orgId);
    if (driverId)
        params.append("driverId", driverId);
    if (to)
        params.append("to", to);
    if (from)
        params.append("from", from);
    params.append("page", page);
    params.append("pageSize", pageSize);

    return useQuery({
        queryKey: ["sales", orgId, driverId, to, from, page, pageSize],
        queryFn: async () => apiFetch(`/sales?${params.toString()}`).then(r => r.json()),
        enabled: !!user && isAdmin,
        placeholderData: keepPreviousData,
        retry: 0
    });
}

export function useInvoices({ orgId, to, from })
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const params = new URLSearchParams();
    if (orgId)
        params.append("orgId", orgId);
    if (to)
        params.append("to", to);
    if (from)
        params.append("from", from);

    return useQuery({
        queryKey: ["invoices", orgId, to, from],
        queryFn: async () => apiFetch(`/sales/invoices?${params.toString()}`).then(r => r.json()),
        enabled: !!user && isAdmin,
        placeholderData: keepPreviousData,
        retry: 0
    });
}

export function useMonthlySaleSummary(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const params = new URLSearchParams();
    if (orgId)
        params.append("orgId", orgId);

    return useQuery({
        queryKey: ["monthlySaleSummary", user?.id, orgId],
        queryFn: async () => apiFetch(`/sales/monthly-summary?${params.toString()}`).then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}

export function useSixMonthSummary(orgId)
{
    const { data: user } = useCurrentUser();
    const isSponsor = user?.userType === USER_TYPES.SPONSOR;
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const params = new URLSearchParams();
    if (orgId)
        params.append("orgId", orgId);

    return useQuery({
        queryKey: ["sixMonthSaleSummary", user?.id, orgId],
        queryFn: async () => apiFetch(`/sales/six-month-summary?${params.toString()}`).then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}