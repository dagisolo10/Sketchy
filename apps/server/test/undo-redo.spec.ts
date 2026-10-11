import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DrawingStateService } from "../src/game/drawing.state.service.js";
import { GameStateService } from "../src/game/game.state.service.js";
import type { Room } from "@package/types";

const roomId = "room-1";

function makeRoom(playerIds: string[]): Room {
    return {
        roomId,
        hostId: playerIds[0]!,
        countdown: 0,
        status: "playing",
        settings: {
            maxPlayers: playerIds.length,
            drawingTime: 60,
            imposters: 0,
        },
        players: playerIds.map((playerId, i) => ({ playerId, name: `p${i}`, ready: true })),
    };
}

describe("DrawingStateService undo/redo", () => {
    let gameService: GameStateService;
    let drawingService: DrawingStateService;
    let emits: { event: string; payload: unknown }[];
    let playerId: string;

    beforeEach(() => {
        emits = [];
        const stubIo = {
            emit: (event: string, payload: unknown) => emits.push({ event, payload }),
            emitTo: (event: string, _roomId: string, payload: unknown) => emits.push({ event, payload }),
        } as never;
        gameService = new GameStateService(stubIo);
        gameService.prepareGame(makeRoom(["a", "b"]));
        drawingService = new DrawingStateService(stubIo, gameService);
        playerId = gameService.getGame(roomId)!.activePlayer.playerId;
    });

    const drawStroke = (i: number) => {
        drawingService.startStroke(roomId, playerId, { x: i, y: i }, "thin", "pen");
        drawingService.addStrokePoint(roomId, playerId, { x: i + 1, y: i + 1 });
        drawingService.endStroke(roomId, playerId);
    };

    const getState = () => gameService.getDrawingState(roomId)!;

    const lastEmit = () => emits.at(-1);

    it("draw -> undo returns strokes to empty", () => {
        drawStroke(1);
        expect(getState().strokes).toHaveLength(1);

        drawingService.undo(roomId, playerId);

        expect(getState().strokes).toHaveLength(0);
        expect(getState().undoHistory).toHaveLength(0);
        expect(getState().redoHistory).toHaveLength(1);
        expect(lastEmit()?.event).toBe("drawing:undo");
    });

    it("draw -> undo -> redo restores the stroke", () => {
        drawStroke(1);
        drawingService.undo(roomId, playerId);
        drawingService.redo(roomId, playerId);

        expect(getState().strokes).toHaveLength(1);
        expect(getState().undoHistory).toHaveLength(1);
        expect(getState().redoHistory).toHaveLength(0);
        expect(lastEmit()?.event).toBe("drawing:redo");
    });

    it("draw -> undo -> redo -> undo returns to empty (redo repopulates undo)", () => {
        drawStroke(1);
        drawingService.undo(roomId, playerId);
        drawingService.redo(roomId, playerId);
        drawingService.undo(roomId, playerId);

        expect(getState().strokes).toHaveLength(0);
        expect(getState().undoHistory).toHaveLength(0);
        expect(getState().redoHistory).toHaveLength(1);
    });

    it("draw x3 -> undo x3 -> redo x3 preserves order", () => {
        drawStroke(1);
        drawStroke(2);
        drawStroke(3);

        drawingService.undo(roomId, playerId);
        drawingService.undo(roomId, playerId);
        drawingService.undo(roomId, playerId);

        expect(getState().strokes).toHaveLength(0);
        expect(getState().redoHistory).toHaveLength(3);

        drawingService.redo(roomId, playerId);
        drawingService.redo(roomId, playerId);
        drawingService.redo(roomId, playerId);

        expect(getState().strokes).toHaveLength(3);
        expect(getState().undoHistory).toHaveLength(3);
        expect(getState().redoHistory).toHaveLength(0);
        expect(getState().strokes.map((s) => s.points[0]!.x)).toEqual([1, 2, 3]);
    });

    it("draw -> undo -> new draw invalidates redo", () => {
        drawStroke(1);
        drawingService.undo(roomId, playerId);
        expect(getState().redoHistory).toHaveLength(1);

        drawStroke(2);

        expect(getState().strokes).toHaveLength(1);
        expect(getState().redoHistory).toHaveLength(0);

        const emitsBefore = emits.length;
        drawingService.redo(roomId, playerId);
        expect(emits.length).toBe(emitsBefore);
    });

    it("undo is ignored while a stroke is in progress", () => {
        drawStroke(1);
        drawingService.startStroke(roomId, playerId, { x: 9, y: 9 }, "thin", "pen");

        drawingService.undo(roomId, playerId);

        expect(getState().strokes).toHaveLength(2);
        expect(getState().undoHistory).toHaveLength(1);
    });

    it("ignores input from players who are not the active drawer", () => {
        const other = gameService.getGame(roomId)!.players.find(({ playerId: id }) => id !== playerId)!;

        drawingService.startStroke(roomId, other.playerId, { x: 1, y: 1 }, "thin", "pen");

        expect(getState().strokes).toHaveLength(0);
    });

    it("tags strokes with the current turn and advances the turn on next", () => {
        expect(getState().turn).toBe(0);

        drawStroke(1);
        expect(getState().strokes[0]!.turn).toBe(0);

        vi.useFakeTimers();
        gameService.getGame(roomId)!.playing = true;
        gameService.next(roomId);
        vi.useRealTimers();

        expect(getState().turn).toBe(1);
    });
});

describe("DrawingStateService guards", () => {
    let gameService: GameStateService;
    let drawingService: DrawingStateService;
    let playerId: string;

    beforeEach(() => {
        const stubIo = {
            emit: () => undefined,
            emitTo: () => undefined,
        } as never;
        gameService = new GameStateService(stubIo);
        drawingService = new DrawingStateService(stubIo, gameService);

        gameService.prepareGame(makeRoom(["a", "b"]));
        playerId = gameService.getGame(roomId)!.activePlayer.playerId;
    });

    it("does not draw when the room has no game in progress", () => {
        drawingService.startStroke("other-room", playerId, { x: 0, y: 0 }, "thin", "pen");
        expect(gameService.getDrawingState("other-room")).toBeUndefined();
    });
});