import { GameStateService } from "@/game/game.state.service.js";
import { CreateRoomDto } from "@/room/room.dto.js";
import { RoomStore } from "@/room/room.store.js";
import { SessionContext } from "@/session/session.context.js";
import { SessionService } from "@/session/session.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { COUNTER_START_TIME, MIN_PLAYERS } from "@package/types";
import { ulid } from "ulid";

@Injectable()
export class RoomService {
    constructor(
        private readonly roomStore: RoomStore,
        private readonly sessionService: SessionService,
        private readonly sessionContext: SessionContext,
        private readonly socketIoService: SocketIoService,
        private readonly gameStateService: GameStateService,
    ) {}

    private countdownIntervals = new Map<string, NodeJS.Timeout>();

    getRooms() {
        return this.roomStore.getRooms();
    }

    getRoom(roomId: string) {
        const { room } = this.validateRoom(roomId);

        return room;
    }

    createRoom({ maxPlayers, drawingTime, imposterCount }: CreateRoomDto) {
        const sessionId = this.sessionContext.getSessionId();

        const player = this.sessionService.getPlayerBySession(sessionId);

        if (!player) {
            throw new UnauthorizedException("You are not in the session");
        }

        let roomId: string;

        do roomId = ulid().slice(-5).toUpperCase();
        while (this.roomStore.getRoom(roomId));

        const room = this.roomStore.addRoom({
            maxPlayers,
            drawingTime,
            imposterCount,
            status: "waiting",
            hostId: player.playerId,
            countdown: COUNTER_START_TIME,
            players: [{ ...player, ready: false }],
            roomId: roomId.slice(-5).toUpperCase(),
        });

        return room;
    }

    joinRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.players.some((p) => p.playerId === player.playerId)) {
            return room;
        }

        if (room.players.length >= room.maxPlayers) {
            throw new ForbiddenException("Room is full");
        }

        room.players.push({ ...player, ready: false });

        return room;
    }

    leaveRoom(roomId: string) {
        const { player } = this.validateRoom(roomId);
        const rooms = this.roomStore.getRooms();

        this.socketIoService.emitTo("player:left:room", roomId, { roomId });

        this.roomStore.setRooms(
            rooms.map((room) =>
                room.roomId === roomId
                    ? {
                          ...room,
                          players: room.players.filter((p) => p.playerId !== player.playerId),
                      }
                    : room,
            ),
        );
    }

    deleteRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.hostId !== player.playerId) {
            throw new ForbiddenException("You are not allowed to delete the room");
        }

        this.roomStore.removeRoom(roomId);
    }

    toggleReady(roomId: string, ready: boolean) {
        const { player, room } = this.validateRoom(roomId);

        const roomPlayer = room.players.find((roomPlayer) => roomPlayer.playerId === player.playerId);

        if (!roomPlayer) {
            throw new BadRequestException("You are not in the room");
        }

        roomPlayer.ready = ready;

        this.socketIoService.emitTo("player:ready:updated", roomId, { roomId });
    }

    startGame(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.hostId !== player.playerId) {
            throw new ForbiddenException("You are not allowed to start the game");
        }

        if (room.status === "starting") {
            throw new BadRequestException("Game is already starting");
        }

        if (room.status === "playing") {
            throw new BadRequestException("Game is already started");
        }

        if (room.players.length < MIN_PLAYERS) {
            throw new BadRequestException(`At least ${MIN_PLAYERS} players are required`);
        }

        if (!room.players.every(({ ready }) => ready)) {
            throw new BadRequestException("Not all players are ready");
        }

        room.status = "starting";

        this.socketIoService.emitTo("room:game:starting", roomId, { roomId });

        const roomInterval = this.countdownIntervals.get(roomId);

        if (!roomInterval) {
            const interval = setInterval(() => {
                if (room.countdown <= 0) {
                    clearInterval(interval);
                    this.countdownIntervals.delete(roomId);

                    room.status = "playing";

                    this.socketIoService.emitTo("room:game:started", roomId, { roomId });

                    return;
                }

                room.countdown -= 1;

                this.socketIoService.emitTo("room:game:countdown", roomId, { count: room.countdown });
            }, 1000);

            this.countdownIntervals.set(roomId, interval);
        }

        this.gameStateService.prepareGame(room);
    }

    private validateRoom(roomId: string) {
        const sessionId = this.sessionContext.getSessionId();

        const player = this.sessionService.getPlayerBySession(sessionId);

        if (!player) {
            throw new BadRequestException("You are not in the session");
        }

        const room = this.roomStore.getRoom(roomId);

        if (!room) {
            throw new NotFoundException("Room not found");
        }

        return { player, room };
    }
}
