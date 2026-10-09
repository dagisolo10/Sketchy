import { GameStateService } from "@/game/game.state.service.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import { ClientData } from "@package/types";

@WebSocketGateway()
export class GameStateGateway {
    constructor(private readonly gameStateService: GameStateService) {}

    @Sub("game:reveal:role")
    revealRole(_client: TypedSocket, { roomId }: ClientData<"game:reveal:role">[0]) {
        this.gameStateService.revealRoles(roomId);
    }

    @Sub("game:get:state")
    getGame(client: TypedSocket, { roomId }: ClientData<"game:get:state">[0]) {
        this.gameStateService.startGame(roomId);

        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingStrokes(roomId);

        if (!game || !drawingState) return;

        client.emit("game:state", { game, drawingState });
    }

    @Sub("game:started")
    startGame(_client: TypedSocket, { roomId }: ClientData<"game:started">[0]) {
        this.gameStateService.startGame(roomId);
    }
}
