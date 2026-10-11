import { DrawingStateService } from "@/game/drawing.state.service.js";
import { GameStateService } from "@/game/game.state.service.js";
import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import type { ClientData } from "@package/types";

@WebSocketGateway()
export class DrawingGateway {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly gameStateService: GameStateService,
        private readonly drawingStateService: DrawingStateService,
    ) {}

    @Sub("drawing:start")
    startStroke(client: TypedSocket, { roomId, tool, penSize, point }: ClientData<"drawing:start">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.drawingStateService.startStroke(roomId, client.data.player.playerId, point, penSize, tool);
    }

    @Sub("drawing:move")
    addStrokePoint(client: TypedSocket, { point, roomId }: ClientData<"drawing:move">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.drawingStateService.addStrokePoint(roomId, client.data.player.playerId, point);
    }

    @Sub("drawing:end")
    endStroke(client: TypedSocket, { roomId }: ClientData<"drawing:end">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.drawingStateService.endStroke(roomId, client.data.player.playerId);
    }

    @Sub("drawing:undo")
    undo(client: TypedSocket, { roomId }: ClientData<"drawing:undo">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.drawingStateService.undo(roomId, client.data.player.playerId);
    }

    @Sub("drawing:redo")
    redo(client: TypedSocket, { roomId }: ClientData<"drawing:redo">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.drawingStateService.redo(roomId, client.data.player.playerId);
    }

    @Sub("drawing:next")
    next(client: TypedSocket, { roomId }: ClientData<"drawing:next">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.next(roomId, client.data.player.playerId);
    }
}
