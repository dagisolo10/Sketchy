import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import type { ClientToServerEvents } from "@package/types";

@WebSocketGateway()
export class RoomGateway {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly socketService: SocketIoService,
    ) {}

    @Sub("room:joined")
    handleMessage(client: TypedSocket, { roomId }: Parameters<ClientToServerEvents["room:joined"]>[0]) {
        client.join(roomId);
        this.socketService.emitTo("player:joined", roomId, { roomId });
    }

    @Sub("room:get:state")
    getRoomState(_client: TypedSocket, { roomId }: Parameters<ClientToServerEvents["room:get:state"]>[0]) {
        const room = this.roomStore.getRoom(roomId);

        if (!room) return;

        this.socketService.emitTo("room:state", roomId, { room });
    }
}
