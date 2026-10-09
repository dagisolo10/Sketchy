import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Player } from "@package/types";
import { ulid } from "ulid";

@Injectable()
export class SessionService {
    private sessions = new Map<string, Player>();
    private disconnectTimers = new Map<string, NodeJS.Timeout>();

    getOrCreateSession() {
        const playerId = ulid();
        const sessionId = ulid();

        const player: Player = {
            playerId,
            ready: false,
            name: `User-${playerId.slice(playerId.length - 3, playerId.length)}`,
        };

        this.sessions.set(sessionId, player);

        return { player, sessionId };
    }

    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }

    getPlayerBySession(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    updatePlayerName(name: string, sessionId: string) {
        const player = this.getPlayerBySession(sessionId);

        if (!player) {
            throw new UnauthorizedException("You don't have an active session");
        }

        player.name = name;

        return player;
    }

    startDisconnectGracePeriod(playerId: string, sessionId: string) {
        this.disconnectTimers.set(
            playerId,
            setTimeout(() => {
                this.deleteSession(sessionId);
                this.disconnectTimers.delete(playerId);
            }, 60_000),
        );
    }

    cancelDisconnectGracePeriod(playerId: string) {
        const timeout = this.disconnectTimers.get(playerId);

        if (!timeout) return;

        clearTimeout(timeout);

        this.disconnectTimers.delete(playerId);
    }
}
