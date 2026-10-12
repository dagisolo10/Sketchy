import { Injectable } from "@nestjs/common";
import { Room } from "@package/types";

@Injectable()
export class RoomStore {
    private rooms: Room[] = [];

    getRooms(): Room[] {
        return this.rooms;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.find((room) => room.roomId === roomId);
    }

    addRoom(room: Room): Room {
        this.rooms.push(room);
        return room;
    }

    removeRoom(roomId: string): void {
        this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
    }

    isPlayerInRoom(roomId: string, playerId: string): boolean {
        return this.rooms.some((room) => room.roomId === roomId && room.players.some((player) => player.playerId === playerId));
    }

    getRoomByPlayer(playerId: string): Room | undefined {
        return this.rooms.find((room) => room.players.some((player) => player.playerId === playerId));
    }

    transferHost(roomId: string, playerId: string): string | null {
        const room = this.getRoom(roomId);

        if (!room) return null;
        if (room.hostId !== playerId || room.players.length < 2) return null;

        const nextHost = room.players.find((player) => player.playerId !== playerId);

        if (!nextHost) return null;

        room.hostId = nextHost.playerId;

        return room.hostId;
    }

    removePlayerFromRooms(playerId: string): Array<{ roomId: string; newHostId: string | null }> {
        const results: Array<{ roomId: string; newHostId: string | null }> = [];

        for (const room of this.rooms) {
            if (!room.players.some((player) => player.playerId === playerId)) continue;

            room.players = room.players.filter((player) => player.playerId !== playerId);

            if (room.hostId === playerId && room.players.length > 0) {
                room.hostId = room.players[0].playerId;
                results.push({ roomId: room.roomId, newHostId: room.hostId });
                continue;
            }

            results.push({ roomId: room.roomId, newHostId: null });
        }

        return results;
    }
}
