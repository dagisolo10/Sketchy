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

    handleConnection(client: TypedSocket) {
        // console.log();

        // console.log("⏰ Connecting to socket...");

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

        client.join(player.playerId);

        // console.log("✅ Socket connected", player.name);

        // console.log("--------------------------");
    }

    handleDisconnect(client: TypedSocket) {
        const { player, sessionId } = client.data;

        if (this.authService.getPlayerBySession(sessionId)) {
            this.authService.startDisconnectGracePeriod(player.playerId, sessionId);
        }

        // console.log("❌ Socket disconnected");
    }
}
