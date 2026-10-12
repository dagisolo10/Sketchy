import { GameModule } from "@/game/game.module.js";
import { RoomModule } from "@/room/room.module.js";
import { SessionModule } from "@/session/session.module.js";
import { ConnectionGateway } from "@/socket.io/connection.gateway.js";
import { DrawingGateway } from "@/socket.io/drawing.gateway.js";
import { GameStateGateway } from "@/socket.io/game.state.gateway.js";
import { RoomGateway } from "@/socket.io/room.gateway.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { VoteGateway } from "@/socket.io/vote.gateway.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [SocketIoService],
    imports: [SessionModule, RoomModule, GameModule],
    providers: [SocketIoService, SocketIoGateway, ConnectionGateway, RoomGateway, GameStateGateway, DrawingGateway, VoteGateway],
})
export class SocketIoModule {}
