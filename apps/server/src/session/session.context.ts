import { ErrorCode } from "@package/types";
import { AppError } from "@/common/errors.js";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable()
export class SessionContext {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    getSessionId() {
        const sessionId = this.request.cookies["session"];

        if (!sessionId) {
            throw new AppError(ErrorCode.SESSION_MISSING, HttpStatus.UNAUTHORIZED, "We couldn't find your session. Please refresh the page and try again.");
        }

        return sessionId;
    }
}
