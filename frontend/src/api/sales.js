import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

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
        queryFn: async () => apiFetch(`/sale-stats/monthly-summary?${params.toString()}`).then(r => r.json()),
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
        queryFn: async () => apiFetch(`/sale-stats/six-month-summary?${params.toString()}`).then(r => r.json()),
        enabled: !!user && (isSponsor || isAdmin),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}