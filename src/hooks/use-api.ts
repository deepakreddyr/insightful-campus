const API_URL = "/api";

export const useApi = () => {
    const fetcher = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Something went wrong");
        }

        return response.json();
    };

    return { fetcher };
};
