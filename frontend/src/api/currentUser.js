import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./apiFetch";

export function useCurrentUser() {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const response = await apiFetch("/auth/me");
            const data = await response.json();
            return data.user ?? null;
        },
        retry: false,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}