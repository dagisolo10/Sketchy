import type { Player } from "@package/types";
import { PlayerDto } from "@/types/models.js";
import type { Request, Response } from "express";
import { SessionService } from "@/session/session.service.js";
import { BadRequestException, Body, Controller, Delete, Get, Patch, Req, Res } from "@nestjs/common";

@Controller("session")
export class SessionController {
    constructor(private readonly authService: SessionService) {}

    @Get()
    getOrCreateSession(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
        let sessionPlayer!: Player;
        let sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            const { player, sessionId: sId } = this.authService.getOrCreateSession();
            sessionId = sId;
            sessionPlayer = player;
        } else {
            const player = this.authService.getPlayerBySession(sessionId);

            if (!player) {
                const { player, sessionId: sId } = this.authService.getOrCreateSession();

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

        // console.log("✅ Logged in");

        return sessionPlayer;
    }

    @Delete()
    deleteSession(@Req() req: Request, @Res() res: Response) {
        const sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            throw new BadRequestException("SessionId is missing");
        }

        res.clearCookie("session");

        return this.authService.deleteSession(sessionId);
    }

    @Patch()
    updatePlayerName(@Body() data: PlayerDto, @Req() req: Request) {
        const sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            throw new BadRequestException("SessionId is missing");
        }

        return this.authService.updatePlayerName(data.name, sessionId);
    }
}
