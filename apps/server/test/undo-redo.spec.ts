import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameStateService } from "../src/game/game.state.service.js";
import type { Room } from "@package/types";

const roomId = "room-1";

function makeRoom(playerIds: string[]): Room {
    return {
        roomId,
        hostId: playerIds[0]!,
        maxPlayers: playerIds.length,
        drawingTime: 60,
        imposterCount: 0,
        countdown: 0,
        status: "playing",
        players: playerIds.map((playerId, i) => ({ playerId, name: `p${i}`, ready: true })),
    };
}

describe("GameStateService undo/redo", () => {
    let service: GameStateService;
    let emits: { event: string; payload: unknown }[];
    let playerId: string;

    beforeEach(() => {
        emits = [];
        const stubIo = {
            emit: (event: string, payload: unknown) => emits.push({ event, payload }),
            emitTo: () => undefined,
        } as never;
        service = new GameStateService(stubIo);
        service.prepareGame(makeRoom(["a", "b"]));
        playerId = service.getGame(roomId)!.activePlayer.playerId;
    });

    const drawStroke = (i: number) => {
        service.startStroke(roomId, playerId, { x: i, y: i }, "thin", "pen");
        service.addStrokePoint(roomId, playerId, { x: i + 1, y: i + 1 });
        service.endStroke(roomId, playerId);
    };

    const lastEmit = () => emits.at(-1);

    it("draw -> undo returns strokes to empty", () => {
        drawStroke(1);
        const drawn = service.getDrawingStrokes(roomId)!;
        expect(drawn.strokes).toHaveLength(1);

        service.undo(roomId);

        const state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(0);
        expect(state.undoHistory).toHaveLength(0);
        expect(state.redoHistory).toHaveLength(1);
        expect(lastEmit()?.event).toBe("drawing:undo");
    });

    it("draw -> undo -> redo restores the stroke", () => {
        drawStroke(1);
        service.undo(roomId);
        service.redo(roomId);

        const state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(1);
        expect(state.undoHistory).toHaveLength(1);
        expect(state.redoHistory).toHaveLength(0);
        expect(lastEmit()?.event).toBe("drawing:redo");
    });

    it("draw -> undo -> redo -> undo returns to empty (redo repopulates undo)", () => {
        drawStroke(1);
        service.undo(roomId);
        service.redo(roomId);
        service.undo(roomId);

        const state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(0);
        expect(state.undoHistory).toHaveLength(0);
        expect(state.redoHistory).toHaveLength(1);
    });

    it("draw x3 -> undo x3 -> redo x3 preserves order", () => {
        drawStroke(1);
        drawStroke(2);
        drawStroke(3);

        service.undo(roomId);
        service.undo(roomId);
        service.undo(roomId);

        let state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(0);
        expect(state.redoHistory).toHaveLength(3);

        service.redo(roomId);
        service.redo(roomId);
        service.redo(roomId);

        state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(3);
        expect(state.undoHistory).toHaveLength(3);
        expect(state.redoHistory).toHaveLength(0);
        expect(state.strokes.map((s) => s.points[0]!.x)).toEqual([1, 2, 3]);
    });

    it("draw -> undo -> new draw invalidates redo", () => {
        drawStroke(1);
        service.undo(roomId);
        expect(service.getDrawingStrokes(roomId)!.redoHistory).toHaveLength(1);

        drawStroke(2);

        const state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(1);
        expect(state.redoHistory).toHaveLength(0);

        const emitsBefore = emits.length;
        service.redo(roomId);
        expect(emits.length).toBe(emitsBefore);
    });

    it("undo is ignored while a stroke is in progress", () => {
        drawStroke(1);
        service.startStroke(roomId, playerId, { x: 9, y: 9 }, "thin", "pen");

        service.undo(roomId);

        const state = service.getDrawingStrokes(roomId)!;
        expect(state.strokes).toHaveLength(2);
        expect(state.undoHistory).toHaveLength(1);
    });

    it("tags strokes with the current turn and advances the turn on next", () => {
        expect(service.getDrawingStrokes(roomId)!.turn).toBe(0);

        drawStroke(1);
        expect(service.getDrawingStrokes(roomId)!.strokes[0]!.turn).toBe(0);

        vi.useFakeTimers();
        service.getGame(roomId)!.playing = true;
        service.next(roomId);
        vi.useRealTimers();

        expect(service.getDrawingStrokes(roomId)!.turn).toBe(1);
    });
});
