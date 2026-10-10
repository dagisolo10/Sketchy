import { GameStateService } from "@/game/game.state.service.js";
import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import { ClientData } from "@package/types";

@WebSocketGateway()
export class DrawingGateway {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly gameStateService: GameStateService,
    ) {}

    @Sub("drawing:start")
    startStroke(client: TypedSocket, { roomId, tool, penSize, point }: ClientData<"drawing:start">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.startStroke(roomId, client.data.player.playerId, point, penSize, tool);
    }

    @Sub("drawing:move")
    addStrokePoint(client: TypedSocket, { point, roomId }: ClientData<"drawing:move">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.addStrokePoint(roomId, client.data.player.playerId, point);
    }

    @Sub("drawing:end")
    endStroke(client: TypedSocket, { roomId }: ClientData<"drawing:end">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.endStroke(roomId, client.data.player.playerId);
    }

    @Sub("drawing:undo")
    undo(client: TypedSocket, { roomId }: ClientData<"drawing:undo">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.undo(roomId, client.data.player.playerId);
    }

    @Sub("drawing:redo")
    redo(client: TypedSocket, { roomId }: ClientData<"drawing:redo">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.redo(roomId, client.data.player.playerId);
    }

    @Sub("drawing:next")
    next(client: TypedSocket, { roomId }: ClientData<"drawing:next">[0]) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.next(roomId, client.data.player.playerId);
    }
}
