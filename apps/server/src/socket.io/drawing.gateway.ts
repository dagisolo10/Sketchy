import { GameStateService } from "@/game/game.state.service.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import { ClientData } from "@package/types";

@WebSocketGateway()
export class DrawingGateway {
    constructor(private readonly gameStateService: GameStateService) {}

    @Sub("drawing:start")
    startStroke(client: TypedSocket, { roomId, tool, penSize, point }: ClientData<"drawing:start">[0]) {
        this.gameStateService.startStroke(roomId, client.data.player.playerId, point, penSize, tool);
    }

    @Sub("drawing:move")
    addStrokePoint(client: TypedSocket, { point, roomId }: ClientData<"drawing:move">[0]) {
        this.gameStateService.addStrokePoint(roomId, client.data.player.playerId, point);
    }

    @Sub("drawing:end")
    endStroke(client: TypedSocket, { roomId }: ClientData<"drawing:end">[0]) {
        this.gameStateService.endStroke(roomId, client.data.player.playerId);
    }

    @Sub("drawing:undo")
    undo(_client: TypedSocket, { roomId }: ClientData<"drawing:undo">[0]) {
        this.gameStateService.undo(roomId);
    }

    @Sub("drawing:redo")
    redo(_client: TypedSocket, { roomId }: ClientData<"drawing:redo">[0]) {
        this.gameStateService.redo(roomId);
    }

    @Sub("drawing:next")
    next(_client: TypedSocket, { roomId }: ClientData<"drawing:next">[0]) {
        this.gameStateService.next(roomId, true);
    }
}
