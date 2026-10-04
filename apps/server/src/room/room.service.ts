import { CreateRoomDto } from "./room.dto.js";

import { RoomStore } from "@/room/room.store.js";
import { SessionContext } from "@/session/session.context.js";
import { SessionService } from "@/session/session.service.js";
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ulid } from "ulid";

@Injectable()
export class RoomService {
    constructor(
        private readonly sessionService: SessionService,
        private readonly sessionContext: SessionContext,
        private readonly roomStore: RoomStore,
    ) {}

    getRooms() {
        return this.roomStore.getRooms();
    }

    getRoom(roomId: string) {
        const { room } = this.validateRoom(roomId);

        return room;
    }

    createRoom({ maxPlayers, drawingTime, imposterCount }: CreateRoomDto) {
        const sessionId = this.sessionContext.getSessionId();

        const player = this.sessionService.getPlayerBySession(sessionId);

        if (!player) {
            throw new UnauthorizedException("You are not in the session");
        }

        let roomId: string;

        do {
            roomId = ulid().slice(-5).toUpperCase();
        } while (this.roomStore.getRoom(roomId));

        const room = this.roomStore.addRoom({
            maxPlayers,
            drawingTime,
            imposterCount,
            players: [player],
            hostId: player.playerId,
            roomId: roomId.slice(-5).toUpperCase(),
        });

        return room;
    }

    joinRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.players.some((p) => p.playerId === player.playerId)) {
            return room;
        }

        if (room.players.length >= room.maxPlayers) {
            throw new ForbiddenException("Room is full");
        }

        room.players.push(player);

        return room;
    }

    leaveRoom(roomId: string) {
        const { player } = this.validateRoom(roomId);
        const rooms = this.roomStore.getRooms();

        const updatedRooms = rooms.map((room) =>
            room.roomId === roomId
                ? {
                      ...room,
                      players: room.players.filter((p) => p.playerId !== player.playerId),
                  }
                : room,
        );

        this.roomStore.setRooms(updatedRooms);
    }

    deleteRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.hostId !== player.playerId) {
            throw new ForbiddenException("You are not allowed to delete the room");
        }

        this.roomStore.removeRoom(roomId);
    }

    private validateRoom(roomId: string) {
        const sessionId = this.sessionContext.getSessionId();

        const player = this.sessionService.getPlayerBySession(sessionId);

        if (!player) {
            throw new Error("You are not in the session");
        }

        const room = this.roomStore.getRoom(roomId);

        if (!room) {
            throw new NotFoundException("Room not found");
        }

        return { player, room };
    }
}
