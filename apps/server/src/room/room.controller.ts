import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UpdateRoomSettingsDto } from "@/room/room.dto.js";
import { RoomService } from "@/room/room.service.js";


@Controller("room")
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @Get()
    getRooms() {
        return this.roomService.getRooms();
    }

    @Get(":roomId")
    getRoom(@Param("roomId") roomId: string) {
        return this.roomService.getRoom(roomId);
    }

    @Post()
    createRoom() {
        return this.roomService.createRoom();
    }

    @Patch(":roomId/settings")
    updateRoomSettings(@Param("roomId") roomId: string, @Body() data: UpdateRoomSettingsDto) {
        return this.roomService.updateRoomSettings(roomId, data);
    }

    @Post("join/:roomId")
    joinRoom(@Param("roomId") roomId: string) {
        return this.roomService.joinRoom(roomId);
    }

    @Delete("leave/:roomId")
    leaveRoom(@Param("roomId") roomId: string) {
        return this.roomService.leaveRoom(roomId);
    }

    @Delete(":roomId")
    deleteRoom(@Param("roomId") roomId: string) {
        return this.roomService.deleteRoom(roomId);
    }

    @Patch(":roomId/ready")
    playerReady(@Param("roomId") roomId: string) {
        return this.roomService.toggleReady(roomId, true);
    }

    @Patch(":roomId/not-ready")
    playerNotReady(@Param("roomId") roomId: string) {
        return this.roomService.toggleReady(roomId, false);
    }

    @Post(":roomId/start-game")
    startGame(@Param("roomId") roomId: string) {
        return this.roomService.startGame(roomId);
    }
}
