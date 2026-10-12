import { AppError } from "@/common/errors.js";
import { RoomStore } from "@/room/room.store.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ErrorCode, Player } from "@package/types";
import { ulid } from "ulid";

@Injectable()
export class SessionService {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly socketIoService: SocketIoService,
    ) {}

    private sessions = new Map<string, Player>();
    private disconnectTimers = new Map<string, NodeJS.Timeout>();

    getOrCreateSession(name?: string) {
        const playerId = ulid();
        const sessionId = ulid();

        const trimmedName = name?.trim().slice(0, 20);

        const player: Player = {
            playerId,
            ready: false,
            name: trimmedName && trimmedName.length > 0 ? trimmedName : `User-${playerId.slice(playerId.length - 3, playerId.length)}`,
            ping: null,
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
            throw new AppError(ErrorCode.SESSION_INACTIVE, HttpStatus.UNAUTHORIZED, "Your session has expired. Please refresh the page to start a new one.");
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

                for (const { roomId, newHostId } of this.roomStore.removePlayerFromRooms(playerId)) {
                    if (newHostId) this.socketIoService.emitTo("room:host:changed", roomId, { newHostId });
                }
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
