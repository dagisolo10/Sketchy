import { create, isAxiosError } from "axios";

export const SERVER_URL = "http://localhost:3000";

export const api = create({
    baseURL: SERVER_URL,
    withCredentials: true,
});

export type ApiError = {
    error: string;
    message: string[];
    statusCode: number;
};

function hasApiError(result: unknown): result is ApiError {
    return typeof result === "object" && result !== null && "error" in result;
}

export async function requestApi<T>(request: () => Promise<{ data: T | ApiError }>): Promise<T> {
    try {
        const { data } = await request();

        if (hasApiError(data)) {
            const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
            throw new Error(msg || "Request failed");
        }

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const serverData = error.response.data as { message?: string | string[] };

            const message = Array.isArray(serverData.message) ? serverData.message.join(", ") : serverData.message;

            throw new Error(message || "Network request failed", { cause: error });
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(typeof error === "string" ? error : "An unexpected error occurred", { cause: error });
    }
}
