export async function request<TResponse>(url: string, config: RequestInit = {}): Promise<TResponse> {
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    try {
        const response = await fetch(`${serverUrl}${url}`, config);

        if (!response.ok) {
            throw new Error(response.statusText);
        } else {
            return (await response.json()) as TResponse;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}
