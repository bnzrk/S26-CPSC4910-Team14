
import { useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useBulkActions()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    return useMutation({
        mutationFn: async ({ file }) =>
        {
            if (!file || file.type !== 'text/plain')
                throw new Error('Only .txt files are supported for bulk actions.');

            const formData = new FormData();
            formData.append('file', file);

            const res = await apiFetch('/bulk', {
                method: 'POST',
                headers: {},
                body: formData,
            });

            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk actions failed' }));
                throw err;
            }

            return res.json();
        },
        retry: 0,
        enabled: isAdmin,
    });
}