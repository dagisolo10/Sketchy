import { DrawingStateService } from "@/game/drawing.state.service.js";
import { GameStateService } from "@/game/game.state.service.js";
import { Module } from "@nestjs/common";

@Module({
    exports: [GameStateService, DrawingStateService],
    providers: [GameStateService, DrawingStateService],
})
export class GameModule {}
