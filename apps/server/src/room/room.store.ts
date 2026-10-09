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
}
