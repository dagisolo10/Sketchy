import { SessionModule } from "@/session/session.module.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    imports: [SessionModule],
    providers: [SocketIoGateway, SocketIoService],
})
export class SocketIoModule {}
