import { AppController } from "@/app.controller.js";
import { AppService } from "@/app.service.js";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    providers: [AppService],
    controllers: [AppController],
})
export class AppModule {}
