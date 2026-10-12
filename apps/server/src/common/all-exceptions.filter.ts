import { ErrorCode, type ApiErrorResponse } from "@package/types";
import { Catch, HttpException, HttpStatus, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { defaultCodeForStatus, defaultErrorForStatus } from "@/common/errors.js";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function stringifyMessage(message: unknown): string | null {
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message)) {
        const parts = message.filter((part): part is string => typeof part === "string" && part.trim().length > 0);
        return parts.length ? parts.join(" ") : null;
    }
    return null;
}

function toErrorResponse(exception: unknown): ApiErrorResponse {
    if (exception instanceof HttpException) {
        const statusCode = exception.getStatus();
        const body = exception.getResponse();

        if (typeof body === "string") {
            return { statusCode, code: defaultCodeForStatus(statusCode), message: body, error: defaultErrorForStatus(statusCode) };
        }

        if (isRecord(body)) {
            const code = typeof body["code"] === "string" ? body["code"] : defaultCodeForStatus(statusCode);
            const message = stringifyMessage(body["message"]) ?? exception.message;
            const error = typeof body["error"] === "string" ? body["error"] : defaultErrorForStatus(statusCode);

            return { statusCode, code, message, error };
        }

        return { statusCode, code: defaultCodeForStatus(statusCode), message: exception.message, error: defaultErrorForStatus(statusCode) };
    }

    return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.INTERNAL_ERROR,
        message: "Something went wrong on our end. Please try again in a moment.",
        error: "Internal Server Error",
    };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();

        const payload = toErrorResponse(exception);

        if (payload.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            console.error("Unhandled request error", exception);
        }

        response.status(payload.statusCode).json(payload);
    }
}
