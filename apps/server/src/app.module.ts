import { AppController } from "@/app.controller.js";
import { AuthModule } from "@/auth/auth.module.js";
import { SocketIoModule } from "@/socket.io/socket.io.module.js";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        SocketIoModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
