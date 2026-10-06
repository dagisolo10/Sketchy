import { Global, Module } from "@nestjs/common";
import { GameModule } from "@/game/game.module.js";
import { RoomModule } from "@/room/room.module.js";
import { RoomGateway } from "@/socket.io/room.gateway.js";
import { SessionModule } from "@/session/session.module.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { GameStateGateway } from "@/socket.io/game.state.gateway.js";

@Global()
@Module({
    exports: [SocketIoService],
    imports: [SessionModule, RoomModule, GameModule],
    providers: [SocketIoGateway, SocketIoService, RoomGateway, GameStateGateway],
})
export class SocketIoModule {}
