import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "@package/types";

const STATUS_ERROR: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: "Bad Request",
    [HttpStatus.UNAUTHORIZED]: "Unauthorized",
    [HttpStatus.FORBIDDEN]: "Forbidden",
    [HttpStatus.NOT_FOUND]: "Not Found",
    [HttpStatus.CONFLICT]: "Conflict",
    [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
};

const STATUS_CODE: Record<number, ErrorCode> = {
    [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
    [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
    [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
    [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
    [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_ERROR,
};

export class AppError extends HttpException {
    constructor(code: ErrorCode, status: HttpStatus, message: string, error?: string) {
        super({ statusCode: status, code, message, error: error ?? STATUS_ERROR[status] ?? "Request Failed" }, status);
    }
}

export function defaultErrorForStatus(status: number): string {
    return STATUS_ERROR[status] ?? "Request Failed";
}

export function defaultCodeForStatus(status: number): ErrorCode {
    return STATUS_CODE[status] ?? ErrorCode.INTERNAL_ERROR;
}
