import { AuthService } from "@/auth/auth.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedServer, TypedSocket } from "@/types/socket-events.js";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ClientToServerEvents } from "@package/types";
import { parseCookie } from "cookie";

export const Sub = (event: keyof ClientToServerEvents) => SubscribeMessage(event);

@WebSocketGateway({ cors: { origin: "*" } })
export class SocketIoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly authService: AuthService,
        private readonly socketService: SocketIoService,
    ) {}

    @WebSocketServer()
    private server!: TypedServer;

    afterInit() {
        this.socketService.setServer(this.server);
    }

    handleConnection(client: TypedSocket) {
        const cookieHeader = client.handshake.headers.cookie;

        if (!cookieHeader) {
            return;
        }

        const cookies = parseCookie(cookieHeader);
        const sessionId = cookies["session"];

        if (!sessionId) return;

        const player = this.authService.getPlayerBySession(sessionId);

        if (!player) return;

        this.authService.cancelDisconnectGracePeriod(player.playerId);

        client.data.player = player;
        client.data.sessionId = sessionId;

        console.log("✅ Socket connected", client.data.player);
    }

    handleDisconnect(client: TypedSocket) {
        const { player, sessionId } = client.data;

        if (this.authService.getPlayerBySession(sessionId)) {
            this.authService.startDisconnectGracePeriod(player.playerId, sessionId);
        }

        console.log("❌ Socket disconnected");
    }
}
