import random from "random";
import { Injectable } from "@nestjs/common";
import { WORDS } from "@/game/game.data.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { DRAWING_DURATION, Game, GamePlayer, Room } from "@package/types";

@Injectable()
export class GameStateService {
    constructor(private readonly socketIoService: SocketIoService) {}

    private gameRoomsMap = new Map<string, Game>();
    private roomRoundTimerMap = new Map<string, NodeJS.Timeout | null>();
    private roomCountdownTimerMap = new Map<string, NodeJS.Timeout | null>();

    prepareGame(room: Room) {
        const players = random.shuffle(room.players).map((p) => ({ ...p, color: this.generateColor() })) as GamePlayer[];

        this.gameRoomsMap.set(room.roomId, {
            players,
            round: 1,
            strokes: [],
            playing: false,
            currentIndex: 0,
            activePlayer: players[0],
            secretWord: random.choice(WORDS)!,
            imposterId: random.choice(players)!.playerId,
        });
    }

    revealRoles(roomId: string) {
        const gameRoom = this.gameRoomsMap.get(roomId);

        if (!gameRoom) return;

        for (const { playerId } of gameRoom.players) {
            this.socketIoService.emitTo("game:role", playerId, {
                role: playerId === gameRoom.imposterId ? "imposter" : "civilian",
                secretWord: playerId === gameRoom.imposterId ? null : gameRoom.secretWord,
            });
        }
    }

    startGame(roomId: string) {
        const gameRoom = this.gameRoomsMap.get(roomId);

        if (!gameRoom || gameRoom.playing) return;

        gameRoom.playing = true;

        this.startTimer(roomId);
    }

    getGame(roomId: string) {
        return this.gameRoomsMap.get(roomId);
    }

    startTimer(roomId: string) {
        const gameRoom = this.gameRoomsMap.get(roomId);

        if (!gameRoom || !gameRoom.playing) return;

        const endTime = Date.now() + DRAWING_DURATION * 1000;

        const emitRemaining = () => {
            const remaining = Math.ceil(Math.max(0, (endTime - Date.now()) / 1000));

            this.socketIoService.emitTo("game:timer", roomId, { remaining });
        };

        emitRemaining();

        this.roomCountdownTimerMap.set(roomId, setInterval(emitRemaining, 1_000));

        this.roomRoundTimerMap.set(
            roomId,
            setTimeout(() => {
                this.next(roomId);
                this.socketIoService.emitTo("game:next_turn", roomId, { activePlayer: gameRoom.activePlayer });
            }, DRAWING_DURATION * 1000),
        );
    }

    next(roomId: string) {
        const gameRoom = this.gameRoomsMap.get(roomId);

        if (!gameRoom || !gameRoom.playing) return;

        const nextIndex = (gameRoom.currentIndex + 1) % gameRoom.players.length;

        gameRoom.currentIndex = nextIndex;
        gameRoom.activePlayer = gameRoom.players[nextIndex];

        gameRoom.strokes.forEach((stroke) => {
            if (stroke.active) stroke.active = false;
        });

        if (nextIndex === 0) {
            gameRoom.round += 1;
            this.socketIoService.emitTo("game:round_count", roomId, { round: gameRoom.round });
        }

        this.clearTimers(roomId);
        this.startTimer(roomId);
    }

    private clearTimers(roomId: string) {
        const timer = this.roomRoundTimerMap.get(roomId);

        if (timer) {
            clearTimeout(timer);
            this.roomRoundTimerMap.delete(roomId);
        }

        const countdown = this.roomCountdownTimerMap.get(roomId);

        if (countdown) {
            clearInterval(countdown);
            this.roomCountdownTimerMap.delete(roomId);
        }
    }

    generateColor() {
        return `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")}`;
    }
}
