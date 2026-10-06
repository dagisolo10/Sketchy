import { GameModule } from "@/game/game.module.js";
import { RoomController } from "@/room/room.controller.js";
import { RoomService } from "@/room/room.service.js";
import { RoomStore } from "@/room/room.store.js";
import { Module } from "@nestjs/common";

@Module({
    exports: [RoomStore],
    imports: [GameModule],
    controllers: [RoomController],
    providers: [RoomStore, RoomService],
})
export class RoomModule {}
