import { STORE_API_URL } from "@/config";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function useProducts({ filters, limit, offset })
{
    const params = new URLSearchParams();

    if (filters)
    {
        Object.entries(filters).forEach(([key, value]) =>
        {
            switch (key)
            {
                case "title":
                    params.append("title", value);
                    break;
                case "category":
                    params.append("category", value);
                    break;
                case "priceMin":
                    params.append("price_min", value);
                    break;
                case "priceMax":
                    params.append("price_max", value);
                    break;
                default:
                    console.warn(`Unknown filter: ${key}`);
            }
        });
    }

    if (limit != null)
        params.append("limit", limit);
    if (offset != null)
        params.append("offset", offset);

    return useQuery({
        queryKey: ["products", filters, limit, offset],
        queryFn: async () => fetch(`${STORE_API_URL}/products?${params.toString()}`).then(r => r.json()),
        retry: 1,
        placeholderData: keepPreviousData,
    });
}