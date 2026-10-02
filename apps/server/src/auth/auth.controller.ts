import { AuthService } from "@/auth/auth.service.js";
import { LoginDto, Player } from "@/types/models.js";
import { BadRequestException, Body, Controller, Delete, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("session")
    getOrCreateSession(@Body() data: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        let sessionPlayer!: Player;
        let sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            const { player, sessionId: sId } = this.authService.getOrCreateSession(data.name);
            sessionId = sId;
            sessionPlayer = player;
        } else {
            const player = this.authService.getPlayerBySession(sessionId);

            if (!player) {
                const { player, sessionId: sId } = this.authService.getOrCreateSession(data.name);

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

        console.log("✅ Logged in");

        return sessionPlayer;
    }

    @Delete("session")
    deleteSession(@Req() req: Request) {
        const sessionId = req.cookies["session"] as string | undefined;

        if (!sessionId) {
            throw new BadRequestException("SessionId is missing");
        }

        return this.authService.deleteSession(sessionId);
    }
}
