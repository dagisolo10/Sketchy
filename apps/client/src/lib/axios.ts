import { create, isAxiosError } from "axios";

export const SERVER_URL = "http://172.20.10.4:3000";

export const api = create({
    baseURL: SERVER_URL,
    withCredentials: true,
});

export type ApiError = {
    error: string;
    message: string[];
    statusCode: number;
};

export function hasApiError(result: unknown): result is ApiError {
    return typeof result === "object" && result !== null && "error" in result;
}

export async function requestApi<T>(request: () => Promise<{ data: T | ApiError }>): Promise<T> {
    try {
        const { data } = await request();

        if (hasApiError(data)) {
            throw data.message;
        }

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const serverData = error.response.data as { message?: string | string[] };

            const message = Array.isArray(serverData.message) ? serverData.message[0] : serverData.message;

            throw message || "Network request failed";
        }

        throw error;
    }
}
