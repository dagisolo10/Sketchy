import { GameStateService } from "@/game/game.state.service.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import { ClientToServerEvents } from "@package/types";

@WebSocketGateway()
export class GameStateGateway {
    constructor(
        private readonly socketService: SocketIoService,
        private readonly gameStateService: GameStateService,
    ) {}

    @Sub("game:reveal:role")
    revealRole(_client: TypedSocket, { roomId }: Parameters<ClientToServerEvents["game:reveal:role"]>[0]) {
        this.gameStateService.revealRoles(roomId);
    }

    @Sub("game:get:state")
    getGame(_client: TypedSocket, { roomId }: Parameters<ClientToServerEvents["game:get:state"]>[0]) {
        this.gameStateService.startGame(roomId);

        const game = this.gameStateService.getGame(roomId);

        if (!game) {
            console.error("Game not found");
            return;
        }

        this.socketService.emitTo("game:state", roomId, { game });
    }

    @Sub("game:started")
    startGame(_client: TypedSocket, { roomId }: Parameters<ClientToServerEvents["game:started"]>[0]) {
        this.gameStateService.startGame(roomId);
    }
}
