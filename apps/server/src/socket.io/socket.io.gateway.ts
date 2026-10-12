import { RoomStore } from "@/room/room.store.js";
import { SessionService } from "@/session/session.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedServer, TypedSocket } from "@/types/socket.js";
import { OnModuleInit } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ClientToServerEvents } from "@package/types";
import { parseCookie } from "cookie";

export const Sub = (event: keyof ClientToServerEvents) => SubscribeMessage(event);

@WebSocketGateway({ cors: { credentials: true, origin: process.env["CLIENT_URL"] } })
export class SocketIoGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly authService: SessionService,
        private readonly socketService: SocketIoService,
        private readonly roomStore: RoomStore,
    ) {}

    @WebSocketServer()
    private server!: TypedServer;

    onModuleInit() {
        this.socketService.setServer(this.server);
    }

    async handleConnection(client: TypedSocket) {
        const cookieHeader = client.handshake.headers.cookie;

        if (!cookieHeader) {
            client.emit("connection_error", "We couldn't start a real-time connection because cookies are disabled. Please enable cookies and refresh.");
            client.disconnect();
            return;
        }

        const sessionId = parseCookie(cookieHeader)["session"];

        if (!sessionId) {
            client.emit("connection_error", "Your session is missing. Please refresh the page to reconnect.");
            client.disconnect();
            return;
        }

        const player = this.authService.getPlayerBySession(sessionId);

        if (!player) {
            client.emit("connection_error", "Your session has expired. Please refresh the page to start a new one.");
            client.disconnect();
            return;
        }

        this.authService.cancelDisconnectGracePeriod(player.playerId);

        client.data.player = player;
        client.data.sessionId = sessionId;

        await client.join(player.playerId);

        this.socketService.setPlayerSocket(player.playerId, client);

        this.socketService.incrementOnline(player.playerId);

        console.log("✅ Socket connected", player.name, `(online: ${this.socketService.getOnlineCount()})`);
    }

    handleDisconnect(client: TypedSocket) {
        if (!client.data.player && !client.data.sessionId) return;

        if (this.authService.getPlayerBySession(client.data.sessionId)) {
            this.authService.startDisconnectGracePeriod(client.data.player.playerId, client.data.sessionId);
        }

        this.socketService.removePlayerSocket(client.data.player.playerId, client);

        this.socketService.decrementOnline(client.data.player.playerId);

        const room = this.roomStore.getRoomByPlayer(client.data.player.playerId);

        if (room) {
            const newHostId = this.roomStore.transferHost(room.roomId, client.data.player.playerId);

            if (newHostId) {
                this.socketService.emitTo("room:host:changed", room.roomId, { newHostId });

                console.log("👑 Host transferred after disconnect", `to ${newHostId}`);
            }
        }

        console.log("❌ Socket disconnected", client.data.player.name, `(online: ${this.socketService.getOnlineCount()})`);
    }
}
