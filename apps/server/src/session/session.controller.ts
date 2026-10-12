import { AppError } from "@/common/errors.js";
import { ErrorCode } from "@package/types";
import { SessionService } from "@/session/session.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { PlayerDto } from "@/types/models.js";
import { Body, Controller, Delete, Get, HttpStatus, Patch, Query, Req, Res } from "@nestjs/common";
import type { Player } from "@package/types";
import type { Request, Response } from "express";

@Controller("session")
export class SessionController {
    constructor(
        private readonly authService: SessionService,
        private readonly socketIoService: SocketIoService,
    ) {}

    @Get("online")
    getOnlineCount() {
        return { online: this.socketIoService.getOnlineCount() };
    }

    @Get()
    getOrCreateSession(@Res({ passthrough: true }) res: Response, @Req() req: Request, @Query("name") name?: string) {
        let sessionPlayer!: Player;
        let sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            const { player, sessionId: sId } = this.authService.getOrCreateSession(name);
            sessionId = sId;
            sessionPlayer = player;
        } else {
            const player = this.authService.getPlayerBySession(sessionId);

            if (!player) {
                const { player, sessionId: sId } = this.authService.getOrCreateSession(name);

                sessionId = sId;
                sessionPlayer = player;
            } else {
                sessionPlayer = player;
            }
        }

        res.cookie("session", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: !!process.env["SECURE"] || false,
        });

        return sessionPlayer;
    }

    @Delete()
    deleteSession(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            throw new AppError(ErrorCode.SESSION_MISSING, HttpStatus.UNAUTHORIZED, "We couldn't find your session. It may have already ended.");
        }

        res.clearCookie("session");

        this.authService.deleteSession(sessionId);
    }

    @Patch()
    updatePlayerName(@Body() data: PlayerDto, @Req() req: Request) {
        const sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            throw new AppError(ErrorCode.SESSION_MISSING, HttpStatus.UNAUTHORIZED, "We couldn't find your session. Please refresh the page and try again.");
        }

        return this.authService.updatePlayerName(data.name, sessionId);
    }
}
