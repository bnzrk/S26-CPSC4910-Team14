import { API_URL } from '../config';

export async function apiFetch(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (response.status === 401) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
    }

    return response;
}