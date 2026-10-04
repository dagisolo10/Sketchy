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

        const player: Player = { name: `User-${playerId.slice(playerId.length - 3, playerId.length)}`, playerId };

        this.sessions.set(sessionId, player);

        console.log("✅ Session created", this.sessions.size);

        return { player, sessionId };
    }

    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
        console.log("Session deleted ❌", this.sessions.size);
    }

    getPlayerBySession(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    updatePlayerName(name: string, sessionId: string) {
        const player = this.getPlayerBySession(sessionId);

        if (!player) {
            throw new UnauthorizedException("You don't have an active session");
        }

        const updatedPlayer: Player = { name, playerId: player.playerId };

        this.sessions.set(sessionId, updatedPlayer);

        console.log("updatedPlayer", updatedPlayer);

        return updatedPlayer;
    }

    startDisconnectGracePeriod(playerId: string, sessionId: string) {
        console.log("⏰ starting disconnect grace period");

        this.disconnectTimers.set(
            playerId,
            setTimeout(() => {
                this.deleteSession(sessionId);
                this.disconnectTimers.delete(playerId);
            }, 60_1000),
        );
    }

    cancelDisconnectGracePeriod(playerId: string) {
        console.log("⏰ ❌ cancelling disconnect grace period");

        const timeout = this.disconnectTimers.get(playerId);

        if (!timeout) return;

        clearTimeout(timeout);

        this.disconnectTimers.delete(playerId);
    }
}
