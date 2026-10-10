import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { COUNTER_START_TIME, MIN_PLAYERS, RoomSettings } from "@package/types";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { GameStateService } from "@/game/game.state.service.js";
import { SessionService } from "@/session/session.service.js";
import { SessionContext } from "@/session/session.context.js";
import { UpdateRoomSettingsDto } from "@/room/room.dto.js";
import { RoomStore } from "@/room/room.store.js";
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
    private readonly DEFAULT_ROOM_SETTINGS: RoomSettings = {
        imposters: 1,
        maxPlayers: 6,
        drawingTime: 30,
    };

    getRooms() {
        return this.roomStore.getRooms();
    }

    getRoom(roomId: string) {
        const { room } = this.validateRoom(roomId);

        return room;
    }

    createRoom() {
        const sessionId = this.sessionContext.getSessionId();

        const player = this.sessionService.getPlayerBySession(sessionId);

        if (!player) {
            throw new UnauthorizedException("You are not in the session");
        }

        let roomId: string;

        do roomId = ulid().slice(-5).toUpperCase();
        while (this.roomStore.getRoom(roomId));

        const room = this.roomStore.addRoom({
            status: "waiting",
            hostId: player.playerId,
            countdown: COUNTER_START_TIME,
            settings: this.DEFAULT_ROOM_SETTINGS,
            players: [{ ...player, ready: false }],
            roomId: roomId.slice(-5).toUpperCase(),
        });

        return room;
    }

    updateRoomSettings(roomId: string, settings: UpdateRoomSettingsDto) {
        const { player, room } = this.validateRoom(roomId);

        if (room.hostId !== player.playerId) {
            throw new ForbiddenException("You are not allowed to edit room settings");
        }

        room.settings = settings;

        this.socketIoService.emitTo("room:settings:updated", roomId, { settings });

        return room;
    }

    joinRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.players.some((p) => p.playerId === player.playerId)) {
            return room;
        }

        if (room.players.length >= room.settings.maxPlayers) {
            throw new ForbiddenException("Room is full");
        }

        room.players.push({ ...player, ready: false });

        this.socketIoService.emitTo("player:joined", roomId, { player: { ...player, ready: false } });

        return room;
    }

    async leaveRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        room.players = room.players.filter(({ playerId }) => playerId !== player.playerId);

        const socket = this.socketIoService.getPlayerSocket(player.playerId);

        if (socket) {
            await socket.leave(roomId);
        }

        this.socketIoService.emitTo("player:left:room", roomId, { playerId: player.playerId });
    }

    deleteRoom(roomId: string) {
        const { player, room } = this.validateRoom(roomId);

        if (room.hostId !== player.playerId) {
            throw new ForbiddenException("You are not allowed to delete the room");
        }

        this.roomStore.removeRoom(roomId);

        // emit to all players in the room that the room has been deleted
    }

    toggleReady(roomId: string, ready: boolean) {
        const { player, room } = this.validateRoom(roomId);

        const roomPlayer = room.players.find((roomPlayer) => roomPlayer.playerId === player.playerId);

        if (!roomPlayer) {
            throw new BadRequestException("You are not in the room");
        }

        roomPlayer.ready = ready;

        this.socketIoService.emitTo("player:ready:updated", roomId, { player: roomPlayer });
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

        this.socketIoService.emitTo("room:game:starting", roomId, { status: room.status });

        const roomInterval = this.countdownIntervals.get(roomId);

        if (!roomInterval) {
            const interval = setInterval(() => {
                if (room.countdown <= 0) {
                    clearInterval(interval);
                    this.countdownIntervals.delete(roomId);

                    room.status = "playing";
                    room.countdown = COUNTER_START_TIME;

                    this.socketIoService.emitTo("room:game:intro:started", roomId, { roomId });

                    return;
                }

                room.countdown -= 1;

                this.socketIoService.emitTo("room:game:countdown", roomId, { countdown: room.countdown, roomId });
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
