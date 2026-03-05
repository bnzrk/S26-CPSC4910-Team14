
import { useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useCreateAdminUser()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    return useMutation({
        mutationFn: async ({ email, username, firstName, lastName, password }) =>
        {
            const res = await apiFetch('/admins', {
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
    });
}