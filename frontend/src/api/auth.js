import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./apiFetch";

export function useStartImpersonation()
{
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async ({ targetUserId }) =>
        {
            const response = await apiFetch(`/auth/impersonation/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(targetUserId),
            });
            if (!response.ok) throw new Error('Failed to start impersonation');
        },
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate('/');
        },
    });
}