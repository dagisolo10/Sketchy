import { GameStateService } from "@/game/game.state.service.js";
import { Module } from "@nestjs/common";

@Module({
    exports: [GameStateService],
    providers: [GameStateService],
})
export class GameModule {}
