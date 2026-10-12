import type { ApiErrorResponse } from "@package/types";
import { create, isAxiosError } from "axios";

export const SERVER_URL = "http://172.20.10.4:3000"; // process.env["SERVER_URL"] ??
// "http://localhost:3000";

export const api = create({
    baseURL: SERVER_URL,
    withCredentials: true,
});

export class ApiRequestError extends Error {
    readonly status?: number;
    readonly code?: string;

    constructor(message: string, options: { status?: number; code?: string; cause?: unknown } = {}) {
        super(message);

        this.name = "ApiRequestError";
        this.status = options.status;
        this.code = options.code;

        if (options.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return typeof value === "object" && value !== null && "message" in value && ("code" in value || "error" in value);
}

function normalizeMessage(message: unknown): string | undefined {
    if (typeof message === "string" && message.trim()) return message;

    if (Array.isArray(message)) {
        const parts = message.filter((part): part is string => typeof part === "string" && part.trim().length > 0);

        return parts.length ? parts.join(" ") : undefined;
    }

    return undefined;
}

export async function requestApi<T>(request: () => Promise<{ data: T | ApiErrorResponse }>): Promise<T> {
    try {
        const { data } = await request();

        if (isApiErrorResponse(data)) {
            throw new ApiRequestError(normalizeMessage(data.message) ?? "Request failed", {
                status: data.statusCode,
                code: typeof data.code === "string" ? data.code : undefined,
            });
        }

        return data;
    } catch (error) {
        if (error instanceof ApiRequestError) throw error;

        if (isAxiosError(error) && error.response?.data) {
            const body = error.response.data as Partial<ApiErrorResponse>;

            throw new ApiRequestError(normalizeMessage(body.message) ?? "We couldn't reach the server. Check your connection and try again.", {
                status: body.statusCode ?? error.response.status,
                code: typeof body.code === "string" ? body.code : undefined,
                cause: error,
            });
        }

        if (error instanceof Error && error.message) {
            throw new ApiRequestError(error.message, { cause: error });
        }

        throw new ApiRequestError("Something unexpected happened. Please try again.", { cause: error });
    }
}
