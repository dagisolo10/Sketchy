import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable()
export class SessionContext {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    getSessionId() {
        const sessionId = this.request.cookies["session"];

        if (!sessionId) {
            throw new UnauthorizedException("Session is missing");
        }

        return sessionId;
    }
}
