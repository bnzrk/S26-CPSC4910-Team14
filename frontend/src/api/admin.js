
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
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

/**
 * Bulk upload users (admin) via CSV file.
 * Expects CSV with columns: email, firstName, lastName, password, role
 * Returns { succeeded: number, failed: { row, reason }[] }
 */
export function useBulkUploadUsers()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;
 
    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);
 
            const res = await apiFetch('/admins/bulk', {
                method: 'POST',
                // Don't set Content-Type — browser sets multipart/form-data boundary automatically
                headers: {},
                body: formData,
            });
 
            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk upload failed' }));
                throw err;
            }
 
            return res.json(); // { succeeded, failed: [{ row, reason }] }
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        retry: 0,
        enabled: isAdmin,
    });
}
 
/**
 * Bulk create sponsor organizations (admin) via CSV file.
 * Expects CSV with columns: sponsorName, pointDollarValue (optional)
 * Returns { succeeded: number, failed: { row, reason }[] }
 */
export function useBulkCreateSponsorOrgs()
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;
 
    return useMutation({
        mutationFn: async ({ file }) =>
        {
            const formData = new FormData();
            formData.append('file', file);
 
            const res = await apiFetch('/sponsor-orgs/bulk', {
                method: 'POST',
                headers: {},
                body: formData,
            });
 
            if (!res.ok)
            {
                const err = await res.json().catch(() => ({ message: 'Bulk create failed' }));
                throw err;
            }
 
            return res.json();
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['allSponsorOrgs'] });
        },
        retry: 0,
        enabled: isAdmin,
    });
}