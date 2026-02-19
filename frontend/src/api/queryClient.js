import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: (error) =>
            {
                if (error?.status === 401)
                {   
                    queryClient.setQueryData(["currentUser"], null);
                    window.location.href = "/login";
                }
            }
        },
        mutations: {
            onError: (error) =>
            {
                if (error?.status === 401)
                {
                    queryClient.setQueryData(["currentUser"], null);
                    window.location.href = "/login";
                }
            }
        }
    }
});
