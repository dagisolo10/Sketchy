import { RoomModule } from "@/room/room.module.js";
import { SessionModule } from "@/session/session.module.js";
import { RoomGateway } from "@/socket.io/room.gateway.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [SocketIoService],
    imports: [SessionModule, RoomModule],
    providers: [SocketIoGateway, SocketIoService, RoomGateway],
})
export class SocketIoModule {}
