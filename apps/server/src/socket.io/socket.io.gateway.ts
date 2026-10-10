import { SessionService } from "@/session/session.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedServer, TypedSocket } from "@/types/socket.js";
import { OnModuleInit } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ClientToServerEvents } from "@package/types";
import { parseCookie } from "cookie";

export const Sub = (event: keyof ClientToServerEvents) => SubscribeMessage(event);

@WebSocketGateway({ cors: { origin: "*" } })
export class SocketIoGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly authService: SessionService,
        private readonly socketService: SocketIoService,
    ) {}

    @WebSocketServer()
    private server!: TypedServer;

    onModuleInit() {
        this.socketService.setServer(this.server);
    }

    async handleConnection(client: TypedSocket) {
        const cookieHeader = client.handshake.headers.cookie;

        if (!cookieHeader) {
            client.emit("connection_error", "Cookie is missing");
            client.disconnect();
            return;
        }

        const sessionId = parseCookie(cookieHeader)["session"];

        if (!sessionId) {
            client.emit("connection_error", "Session is missing");
            client.disconnect();
            return;
        }

        const player = this.authService.getPlayerBySession(sessionId);

        if (!player) {
            client.emit("connection_error", "Player session not found");
            client.disconnect();
            return;
        }

        this.authService.cancelDisconnectGracePeriod(player.playerId);

        client.data.player = player;
        client.data.sessionId = sessionId;

        await client.join(player.playerId);

        this.socketService.setPlayerSocket(player.playerId, client);

        console.log("✅ Socket connected", player.name);
    }

    handleDisconnect(client: TypedSocket) {
        if (!client.data.player && !client.data.sessionId) return;

        if (this.authService.getPlayerBySession(client.data.sessionId)) {
            this.authService.startDisconnectGracePeriod(client.data.player.playerId, client.data.sessionId);
        }

        this.socketService.removePlayerSocket(client.data.player.playerId, client);

        console.log("❌ Socket disconnected");
    }
}
