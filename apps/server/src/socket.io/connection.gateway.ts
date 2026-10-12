import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import type { ClientData } from "@package/types";

@WebSocketGateway()
export class ConnectionGateway {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly socketIoService: SocketIoService,
    ) {}

    @Sub("connection:ping")
    ping() {
        return Date.now();
    }

    @Sub("connection:update")
    updatePing(client: TypedSocket, { ping }: ClientData<"connection:update">) {
        const player = client.data.player;

        if (!player) return;

        player.ping = ping;

        const room = this.roomStore.getRoomByPlayer(player.playerId);

        if (room) {
            this.socketIoService.emitTo("player:ping:updated", room.roomId, { playerId: player.playerId, ping });
        }
    }
}
