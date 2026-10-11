import { GameStateService } from "@/game/game.state.service.js";
import { RoomStore } from "@/room/room.store.js";
import { Sub } from "@/socket.io/socket.io.gateway.js";
import type { TypedSocket } from "@/types/socket.js";
import { WebSocketGateway } from "@nestjs/websockets";
import type { ClientData } from "@package/types";

@WebSocketGateway()
export class VoteGateway {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly gameStateService: GameStateService,
    ) {}

    @Sub("game:voting:ready")
    startVoting(client: TypedSocket, { roomId }: ClientData<"game:voting:ready">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.startVoting(roomId, client.data.player.playerId);
    }

    @Sub("game:voting:cast")
    votePlayer(client: TypedSocket, { roomId, targetId }: ClientData<"game:voting:cast">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.votePlayer(roomId, client.data.player.playerId, targetId);
    }

    @Sub("game:voting:continue")
    continueAfterResult(client: TypedSocket, { roomId }: ClientData<"game:voting:continue">) {
        if (!this.roomStore.isPlayerInRoom(roomId, client.data.player.playerId)) return;

        this.gameStateService.continueAfterResult(roomId);
    }
}