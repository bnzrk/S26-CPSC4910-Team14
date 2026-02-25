import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function usePoints() {
    const { data: user } = useCurrentUser();
    const isDriver = user?.userType === USER_TYPES.DRIVER;

    return useQuery({
        queryKey: ["points", user?.id],
        queryFn: async () => apiFetch('/drivers/points').then(r => r.json()),
        enabled: !!user && isDriver,
    });
}