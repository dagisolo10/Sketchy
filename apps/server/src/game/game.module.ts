import { GameController } from "@/game/game.controller.js";
import { GameService } from "@/game/game.service.js";
import { Module } from "@nestjs/common";

@Module({
    providers: [GameService],
    controllers: [GameController],
})
export class GameModule {}
