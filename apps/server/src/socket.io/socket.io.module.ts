import { AuthModule } from "@/auth/auth.module.js";
import { SocketIoGateway } from "@/socket.io/socket.io.gateway.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Module } from "@nestjs/common";

@Module({
    imports: [AuthModule],
    providers: [SocketIoGateway, SocketIoService],
})
export class SocketIoModule {}
