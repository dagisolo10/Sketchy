import { GameController } from "@/game/game.controller.js";
import { GameService } from "@/game/game.service.js";
import { GameStateService } from "@/game/game.state.service.js";
import { Module } from "@nestjs/common";

@Module({
    exports: [GameStateService],
    providers: [GameService, GameStateService],
    controllers: [GameController],
})
export class GameModule {}
