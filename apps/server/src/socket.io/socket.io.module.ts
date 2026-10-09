import { GameStateGateway } from "@/socket.io/game.state.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { DrawingGateway } from "@/socket.io/drawing.gateway.js";
import { SessionModule } from "@/session/session.module.js";
import { RoomGateway } from "@/socket.io/room.gateway.js";
import { RoomModule } from "@/room/room.module.js";
import { GameModule } from "@/game/game.module.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [SocketIoService],
    imports: [SessionModule, RoomModule, GameModule],
    providers: [SocketIoService, SocketIoGateway, RoomGateway, GameStateGateway, DrawingGateway],
})
export class SocketIoModule {}
