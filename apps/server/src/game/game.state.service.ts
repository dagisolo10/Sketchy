import { WORDS } from "@/game/game.data.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Injectable } from "@nestjs/common";
import { DRAWING_DURATION, DrawingState, Game, GamePlayer, PenSize, Point, Room, Stroke, Tool } from "@package/types";
import random from "random";

@Injectable()
export class GameStateService {
    constructor(private readonly socketIoService: SocketIoService) {}

    private gamesMap = new Map<string, Game>();
    private drawingStateMap = new Map<string, DrawingState>();

    private roomRoundTimerMap = new Map<string, NodeJS.Timeout | null>();
    private roomCountdownTimerMap = new Map<string, NodeJS.Timeout | null>();

    getGame(roomId: string) {
        return this.gamesMap.get(roomId);
    }

    prepareGame(room: Room) {
        const players = random.shuffle(room.players).map((p) => ({ ...p, color: this.generateColor() })) as GamePlayer[];

        // add more imposters

        this.gamesMap.set(room.roomId, {
            players,
            round: 1,
            playing: false,
            currentIndex: 0,
            activePlayer: players[0],
            remaining: room.drawingTime,
            secretWord: random.choice(WORDS)!,
            imposterId: random.choice(players)!.playerId,
        });

        this.drawingStateMap.set(room.roomId, {
            turn: 0,
            strokes: [],
            undoHistory: [],
            redoHistory: [],
            activeStrokes: new Map(),
        });
    }

    revealRoles(roomId: string) {
        const game = this.getGame(roomId);

        if (!game) return;

        for (const { playerId } of game.players) {
            this.socketIoService.emitTo("game:role", playerId, {
                role: playerId === game.imposterId ? "imposter" : "civilian",
                secretWord: playerId === game.imposterId ? null : game.secretWord,
            });
        }
    }

    startGame(roomId: string) {
        const game = this.getGame(roomId);

        if (!game || game.playing) return;

        game.playing = true;

        this.startTimer(roomId);
    }

    startTimer(roomId: string) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || !game.playing || !drawingState) return;

        const endTime = Date.now() + DRAWING_DURATION * 1000;

        const emitRemaining = () => {
            const remaining = Math.ceil(Math.max(0, (endTime - Date.now()) / 1000));

            game.remaining = remaining;

            this.socketIoService.emitTo("game:timer", roomId, { remaining });
        };

        emitRemaining();

        this.roomCountdownTimerMap.set(roomId, setInterval(emitRemaining, 1_000));

        this.roomRoundTimerMap.set(
            roomId,
            setTimeout(() => {
                this.next(roomId);
                this.socketIoService.emitTo("game:next_turn", roomId, { activePlayer: game.activePlayer, drawingState });
            }, DRAWING_DURATION * 1000),
        );
    }

    next(roomId: string, manual = false) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || !game.playing || !drawingState) return;

        const nextIndex = (game.currentIndex + 1) % game.players.length;

        game.currentIndex = nextIndex;
        game.activePlayer = game.players[nextIndex];

        drawingState.activeStrokes.clear();
        drawingState.strokes.forEach((stroke) => (stroke.active = false));
        drawingState.turn += 1;

        drawingState.undoHistory = [];
        drawingState.redoHistory = [];

        if (nextIndex === 0) {
            game.round += 1;
            this.socketIoService.emitTo("game:round_count", roomId, { round: game.round, drawingState });
        }

        if (manual) {
            this.socketIoService.emitTo("game:next_turn", roomId, { activePlayer: game.activePlayer, drawingState });
        }

        this.clearTimers(roomId);
        this.startTimer(roomId);
    }

    startStroke(roomId: string, playerId: string, point: Point, penSize: PenSize, tool: Tool) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || !drawingState || game.activePlayer.playerId !== playerId) return;

        const player = game.players.find(({ playerId: id }) => id === playerId);

        if (!player) return;

        const stroke: Stroke = {
            tool,
            penSize,
            playerId,
            active: true,
            points: [point],
            color: player.color,
            turn: drawingState.turn,
        };

        drawingState.strokes.push(stroke);
        drawingState.activeStrokes.set(playerId, stroke);

        this.socketIoService.emit("drawing:start", { penSize, point, tool, color: player.color, turn: stroke.turn });
    }

    addStrokePoint(roomId: string, playerId: string, point: Point) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || game.activePlayer.playerId !== playerId || !drawingState) return;

        const player = game.players.find(({ playerId: id }) => id === playerId);

        if (!player) return;

        const stroke = drawingState.activeStrokes.get(playerId);

        if (!stroke) return;

        stroke.points.push(point);

        this.socketIoService.emit("drawing:move", { point, color: player.color });
    }

    endStroke(roomId: string, playerId: string) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!drawingState || !game || game.activePlayer.playerId !== playerId) return;

        const stroke = drawingState.activeStrokes.get(playerId);

        if (!stroke) return;

        stroke.active = false;

        drawingState.activeStrokes.delete(playerId);

        drawingState.undoHistory.push(stroke);
        drawingState.redoHistory = [];

        this.socketIoService.emit("drawing:end", { drawingState });
    }

    undo(roomId: string) {
        const drawingState = this.drawingStateMap.get(roomId);

        if (!drawingState || drawingState.undoHistory.length === 0) return;

        if (drawingState.strokes.at(-1)?.active) return;

        const stroke = drawingState.undoHistory.pop()!;

        drawingState.strokes.pop();
        drawingState.redoHistory.push(stroke);

        this.socketIoService.emit("drawing:undo", { drawingState });
    }

    redo(roomId: string) {
        const drawingState = this.drawingStateMap.get(roomId);

        if (!drawingState || drawingState.redoHistory.length === 0) return;

        if (drawingState.strokes.at(-1)?.active) return;

        const stroke = drawingState.redoHistory.pop()!;

        drawingState.strokes.push(stroke);
        drawingState.undoHistory.push(stroke);

        this.socketIoService.emit("drawing:redo", { drawingState });
    }

    getDrawingStrokes(roomId: string) {
        return this.drawingStateMap.get(roomId);
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

    private generateColor() {
        return `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")}`;
    }
}
