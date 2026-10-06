import { CreateRoomDto } from "@/room/room.dto.js";
import { RoomService } from "@/room/room.service.js";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

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
    createRoom(@Body() data: CreateRoomDto) {
        return this.roomService.createRoom(data);
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
