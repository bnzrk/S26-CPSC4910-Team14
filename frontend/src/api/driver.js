import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./currentUser";
import { apiFetch } from "./apiFetch";
import { USER_TYPES } from "../constants/userTypes";

export function useEditDriverProfile()
{
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ driverId, email, firstName, lastName }) =>
        {
            const path = driverId != null ? `/drivers/${driverId}/profile` : `/drivers/profile`;
            const res = await apiFetch(path, {
                method: "PATCH",
                body: JSON.stringify({ email, firstName, lastName }),
            });

            if (!res.ok)
            {
                throw await res.json();
            }

            return null;
        },
        onError: (_err, _vars, ctx) =>
        {
            if (ctx?.previousOrg)
            {
                queryClient.setQueryData(ctx.queryKey, ctx.previousOrg);
            }
        },
        onSettled: (_data, _err, { driverId }) =>
        {
            const queryKey = ["sponsorOrgDriver"];
            queryClient.invalidateQueries({ queryKey });
        }
    });
}