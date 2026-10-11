import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameStateService } from "../src/game/game.state.service.js";
import type { GameWinner, Room } from "@package/types";

const roomId = "room-1";

function makeRoom(playerIds: string[], imposters = 1): Room {
    return {
        roomId,
        hostId: playerIds[0]!,
        countdown: 0,
        status: "playing",
        settings: {
            maxPlayers: playerIds.length,
            drawingTime: 60,
            imposters,
        },
        players: playerIds.map((playerId, i) => ({ playerId, name: `p${i}`, ready: true })),
    };
}

describe("GameStateService voting", () => {
    let service: GameStateService;
    let emits: { event: string; payload: unknown }[];

    beforeEach(() => {
        emits = [];
        const stubIo = {
            emit: (event: string, payload: unknown) => emits.push({ event, payload }),
            emitTo: (event: string, _roomId: string, payload: unknown) => emits.push({ event, payload }),
        } as never;
        service = new GameStateService(stubIo);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const emitted = (event: string) => emits.filter(({ event: e }) => e === event);

    const last = (event: string) => emitted(event).at(-1)?.payload;

    const startVote = () => {
        service.prepareVote(roomId);
        service.startVoting(roomId);
    };

    const cast = (voter: string, target: string | null) => service.votePlayer(roomId, voter, target);

    const resolve = () => vi.advanceTimersByTime(31_000);

    const forceImposters = (playerIds: string[]) => {
        const game = service.getGame(roomId)!;
        game.imposters = game.players.filter(({ playerId }) => playerIds.includes(playerId));
    };

    const votesOf = (voter: string) => {
        const votes = (last("game:voting:vote:updated") as { votes: { voterId: string; voteeId: string | null; submitted: boolean }[] })!.votes;
        return votes.find((vote) => vote.voterId === voter)!;
    };

    describe("prepareVote + startVoting", () => {
        it("creates one intro vote per alive player and does not count eliminated players", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            const game = service.getGame(roomId)!;
            game.players = game.players.map((p) => (p.playerId === "c" ? { ...p, eliminated: true } : p));

            service.prepareVote(roomId);

            const starting = last("game:voting:starting") as { voteState: { votes: unknown[]; phase: string; round: number; remaining: number } };
            expect(starting.voteState.phase).toBe("intro");
            expect(starting.voteState.round).toBe(game.round);
            expect(starting.voteState.remaining).toBe(30);
            expect(starting.voteState.votes).toHaveLength(2);
            expect((starting.voteState.votes as { voterId: string }[]).map((v) => v.voterId).sort()).toEqual(["a", "b"]);
        });

        it("startVoting only works from intro and only emits begin once", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            service.prepareVote(roomId);

            service.startVoting(roomId);
            service.startVoting(roomId);

            expect(emitted("game:voting:begin")).toHaveLength(1);
        });

        it("ignores votes before voting has started", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            service.prepareVote(roomId);

            cast("a", "b");

            expect(emitted("game:voting:vote:updated")).toHaveLength(0);
        });

        it("does not let an eliminated player start the voting", () => {
            vi.useFakeTimers();
            service.prepareGame(makeRoom(["a", "b", "c"]));
            const game = service.getGame(roomId)!;
            game.players = game.players.map((p) => (p.playerId === "a" ? { ...p, eliminated: true } : p));
            service.prepareVote(roomId);

            service.startVoting(roomId, "a");

            const starting = last("game:voting:starting") as { voteState: { phase: string } };
            expect(starting.voteState.phase).toBe("intro");
            expect(emitted("game:voting:begin")).toHaveLength(0);

            service.startVoting(roomId, "b");

            expect(emitted("game:voting:begin")).toHaveLength(1);
        });
    });

    describe("votePlayer", () => {
        beforeEach(() => {
            vi.useFakeTimers();
            service.prepareGame(makeRoom(["a", "b", "c"]));
            startVote();
        });

        it("records a valid vote and forbids double submission", () => {
            cast("a", "b");
            cast("a", "c");

            expect(votesOf("a").voteeId).toBe("b");

            cast("b", "a");
            cast("c", "a");

            resolve();

            const result = last("game:voting:result") as { result: { playerId: string; role: "imposter" | "civilian" } | null };
            expect(result.result?.playerId).toBe("a");
        });

        it("accepts null as a skip vote", () => {
            cast("a", null);

            expect(votesOf("a").voteeId).toBeNull();
            expect(votesOf("a").submitted).toBe(true);
        });

        it("ignores self votes", () => {
            cast("a", "a");
            cast("a", "b");

            expect(votesOf("a").voteeId).toBe("b");
            expect(emitted("game:voting:vote:updated")).toHaveLength(1);
        });

        it("ignores votes referencing eliminated or unknown targets", () => {
            const game = service.getGame(roomId)!;
            game.players = game.players.map((p) => (p.playerId === "b" ? { ...p, eliminated: true } : p));

            cast("a", "b");
            cast("a", "ghost");

            expect(emitted("game:voting:vote:updated")).toHaveLength(0);
        });

        it("ignores votes from eliminated or non-participating players", () => {
            const game = service.getGame(roomId)!;
            game.players = game.players.map((p) => (p.playerId === "c" ? { ...p, eliminated: true } : p));

            cast("c", "a");

            expect(emitted("game:voting:vote:updated")).toHaveLength(0);
        });
    });

    describe("resolve", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it("eliminates the majority target and reveals the imposter role", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            forceImposters(["a"]);
            startVote();

            cast("a", "b");
            cast("b", "a");
            cast("c", "a");

            resolve();

            const result = last("game:voting:result") as { phase: string; result: { playerId: string; name: string; role: "imposter" | "civilian" } };
            expect(result.phase).toBe("result");
            expect(result.result.playerId).toBe("a");
            expect(result.result.role).toBe("imposter");
            expect(service.getGame(roomId)!.players.find(({ playerId }) => playerId === "a")!.eliminated).toBe(true);
        });

        it("does not eliminate on a tie", () => {
            service.prepareGame(makeRoom(["a", "b", "c", "d"]));
            startVote();

            cast("a", "b");
            cast("b", "a");
            cast("c", "b");
            cast("d", "a");

            resolve();

            const result = last("game:voting:result") as { result: unknown };
            expect(result.result).toBeNull();
            expect(service.getGame(roomId)!.players.every(({ eliminated }) => !eliminated)).toBe(true);
        });

        it("does not eliminate below the strict majority threshold", () => {
            service.prepareGame(makeRoom(["a", "b", "c", "d"]));
            startVote();

            cast("a", "b");
            cast("b", "c");

            resolve();

            const result = last("game:voting:result") as { result: unknown };
            expect(result.result).toBeNull();
        });

        it("does not eliminate when everyone skips", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            startVote();

            cast("a", null);
            cast("b", null);
            cast("c", null);

            resolve();

            const result = last("game:voting:result") as { result: unknown };
            expect(result.result).toBeNull();
        });
    });

    describe("continueAfterResult", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        const reachResult = () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            startVote();
            cast("a", null);
            cast("b", null);
            cast("c", null);
            resolve();
        };

        it("ignores continue unless the result has been shown", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            startVote();

            service.continueAfterResult(roomId);

            expect(emitted("game:over")).toHaveLength(0);
            expect(emitted("game:state")).toHaveLength(0);
        });

        it("declares civilians the winner once every imposter is eliminated", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            forceImposters(["a"]);
            startVote();

            cast("a", "b");
            cast("b", "a");
            cast("c", "a");

            resolve();

            const game = service.getGame(roomId)!;

            service.continueAfterResult(roomId);

            const gameOver = last("game:over") as { winner: GameWinner };
            expect(gameOver.winner).toBe("civilians");
            expect(game.playing).toBe(false);
            expect(game.imposters[0]!.playerId).toBe("a");
            expect(game.players.find(({ playerId }) => playerId === "a")!.eliminated).toBe(true);

            expect(service.getGame(roomId)).toBeUndefined();
            expect(service.getDrawingState(roomId)).toBeUndefined();

            const roomState = last("room:state") as { room: Room };
            expect(roomState.room.status).toBe("waiting");
            expect(roomState.room.players).toHaveLength(3);
            expect(roomState.room.players.every(({ ready }) => !ready)).toBe(true);
        });

        it("declares imposters the winner as soon as they outnumber civilians", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            forceImposters(["a", "b"]);
            startVote();
            cast("a", null);
            cast("b", null);
            cast("c", null);
            resolve();

            const game = service.getGame(roomId)!;

            service.continueAfterResult(roomId);

            const gameOver = last("game:over") as { winner: GameWinner };
            expect(gameOver.winner).toBe("imposters");
            expect(game.playing).toBe(false);
        });

        it("starts the next round when the game continues", () => {
            reachResult();

            service.continueAfterResult(roomId);

            const game = service.getGame(roomId)!;
            const drawingState = service.getDrawingState(roomId)!;

            expect(game.round).toBe(2);
            expect(game.playing).toBe(true);
            expect(drawingState.turn).toBe(0);
            expect(drawingState.strokes).toHaveLength(0);
            expect(emitted("game:state")).toHaveLength(1);
            expect(emitted("game:timer")).toHaveLength(1);
        });

        it("keeps the accumulated strokes when a new round starts", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            service.getDrawingState(roomId)!.strokes.push({
                tool: "pen",
                penSize: "thin",
                playerId: "a",
                active: true,
                points: [{ x: 1, y: 1 }],
                color: "#ffffff",
                turn: 0,
            });

            startVote();
            cast("a", null);
            cast("b", null);
            cast("c", null);
            resolve();

            service.continueAfterResult(roomId);

            expect(service.getDrawingState(roomId)!.strokes).toHaveLength(1);
        });

        it("resolves early once every alive player has submitted their vote", () => {
            service.prepareGame(makeRoom(["a", "b", "c"]));
            startVote();

            cast("a", "b");
            cast("b", "a");
            cast("c", "a");

            const result = last("game:voting:result") as { result: { playerId: string } | null };
            expect(result.result?.playerId).toBe("a");
            expect(emitted("game:voting:result")).toHaveLength(1);
        });
    });

    describe("turn advancement", () => {
        it("next() skips eliminated players", () => {
            vi.useFakeTimers();
            service.prepareGame(makeRoom(["a", "b", "c", "d"]));
            const game = service.getGame(roomId)!;
            game.playing = true;

            const eliminatedIndex = (game.currentIndex + 1) % game.players.length;
            game.players = game.players.map((p, i) => (i === eliminatedIndex ? { ...p, eliminated: true } : p));
            const expected = game.players[(eliminatedIndex + 1) % game.players.length]!;

            service.next(roomId);

            expect(game.activePlayer.playerId).toBe(expected.playerId);
            expect(service.getDrawingState(roomId)!.turn).toBe(1);
        });

        it("next() sends the room to voting once every alive player has drawn", () => {
            vi.useFakeTimers();
            service.prepareGame(makeRoom(["a", "b", "c"]));
            const game = service.getGame(roomId)!;
            game.playing = true;
            service.getDrawingState(roomId)!.turn = 2;

            service.next(roomId);

            expect(emitted("game:voting:starting")).toHaveLength(1);
            expect(emitted("game:next_turn")).toHaveLength(0);
        });
    });
});