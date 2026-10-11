import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import type { ClientData } from "@package/types";

@WebSocketGateway()
export class RoomGateway {
    constructor(private readonly roomStore: RoomStore) {}

    @Sub("room:joined")
    async playerJoinedRoom(client: TypedSocket, { roomId }: ClientData<"room:joined">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        await client.join(roomId);
    }

    @Sub("room:get:state")
    getRoomState(client: TypedSocket, { roomId }: ClientData<"room:get:state">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        const room = this.roomStore.getRoom(roomId);

        if (!room) return;

        client.emit("room:state", { room });
    }
}
