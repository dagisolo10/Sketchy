import { AppController } from "@/app.controller.js";
import { GameModule } from "@/game/game.module.js";
import { RoomModule } from "@/room/room.module.js";
import { SessionModule } from "@/session/session.module.js";
import { SocketIoModule } from "@/socket.io/socket.io.module.js";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), SessionModule, GameModule, SocketIoModule, RoomModule],
    controllers: [AppController],
})
export class AppModule {}
