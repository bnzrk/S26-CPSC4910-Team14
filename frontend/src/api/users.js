import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useUsers({ pageSize = 20, page = 1, query })
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      });

      if (query)
         params.append("query", query);

    return useQuery({
        queryKey: ["users", pageSize, page, query],
        queryFn: async () => apiFetch(`/users?${params.toString()}`).then(r => r.json()),
        enabled: !!user && isAdmin,
        placeholderData: keepPreviousData,
    });
}