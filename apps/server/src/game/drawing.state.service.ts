import { GameStateService } from "@/game/game.state.service.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Injectable } from "@nestjs/common";
import { PenSize, Point, Stroke, Tool } from "@package/types";

@Injectable()
export class DrawingStateService {
    constructor(
        private readonly socketIoService: SocketIoService,
        private readonly gameStateService: GameStateService,
    ) {}

    startStroke(roomId: string, playerId: string, point: Point, penSize: PenSize, tool: Tool) {
        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingState(roomId);

        if (!game || !drawingState || game.activePlayer.playerId !== playerId) return;

        const player = game.players.find(({ playerId: id }) => id === playerId);

        if (!player || player.eliminated) return;

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

        let activeStrokes = this.gameStateService.getActiveStrokes(roomId);
        if (!activeStrokes) {
            activeStrokes = new Map();
            this.gameStateService.setActiveStrokes(roomId, activeStrokes);
        }
        activeStrokes.set(playerId, stroke);

        this.socketIoService.emitTo("drawing:start", roomId, { penSize, point, tool, color: player.color, turn: stroke.turn });
    }

    addStrokePoint(roomId: string, playerId: string, point: Point) {
        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingState(roomId);

        if (!game || game.activePlayer.playerId !== playerId || !drawingState) return;

        const player = game.players.find(({ playerId: id }) => id === playerId);

        if (!player || player.eliminated) return;

        const stroke = this.gameStateService.getActiveStrokes(roomId)?.get(playerId);

        if (!stroke) return;

        stroke.points.push(point);

        this.socketIoService.emitTo("drawing:move", roomId, { point, color: player.color });
    }

    endStroke(roomId: string, playerId: string) {
        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingState(roomId);

        if (!drawingState || !game || game.activePlayer.playerId !== playerId) return;

        const player = game.players.find(({ playerId: id }) => id === playerId);

        if (!player || player.eliminated) return;

        const stroke = this.gameStateService.getActiveStrokes(roomId)?.get(playerId);

        if (!stroke) return;

        stroke.active = false;

        this.gameStateService.getActiveStrokes(roomId)?.delete(playerId);

        drawingState.undoHistory.push(stroke);
        drawingState.redoHistory = [];

        this.socketIoService.emitTo("drawing:end", roomId, { drawingState });
    }

    undo(roomId: string, playerId: string) {
        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingState(roomId);

        if (!drawingState || drawingState.undoHistory.length === 0 || (playerId && game && game.activePlayer.playerId !== playerId)) return;

        if (drawingState.strokes.at(-1)?.active) return;

        const stroke = drawingState.undoHistory.pop()!;

        drawingState.strokes.pop();
        drawingState.redoHistory.push(stroke);

        this.socketIoService.emitTo("drawing:undo", roomId, { drawingState });
    }

    redo(roomId: string, playerId: string) {
        const game = this.gameStateService.getGame(roomId);
        const drawingState = this.gameStateService.getDrawingState(roomId);

        if (!drawingState || drawingState.redoHistory.length === 0 || (playerId && game && game.activePlayer.playerId !== playerId)) return;

        if (drawingState.strokes.at(-1)?.active) return;

        const stroke = drawingState.redoHistory.pop()!;

        drawingState.strokes.push(stroke);
        drawingState.undoHistory.push(stroke);

        this.socketIoService.emitTo("drawing:redo", roomId, { drawingState });
    }
}
