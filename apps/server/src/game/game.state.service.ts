import { WORDS } from "@/game/game.data.js";
import { SocketIoService } from "@/socket.io/socket.io.service.js";
import { Injectable } from "@nestjs/common";
import { COUNTER_START_TIME, DrawingState, Game, GamePlayer, GameWinner, Room, Stroke, Vote, VOTING_DURATION, VotingState } from "@package/types";
import random from "random";

@Injectable()
export class GameStateService {
    constructor(private readonly socketIoService: SocketIoService) {}

    private gamesMap = new Map<string, Game>();
    private voteStateMap = new Map<string, VotingState>();
    private drawingStateMap = new Map<string, DrawingState>();
    private activeStrokesMap = new Map<string, Map<string, Stroke>>();
    private roomMap = new Map<string, Room>();

    private votingTimerMap = new Map<string, NodeJS.Timeout | null>();
    private roomRoundTimerMap = new Map<string, NodeJS.Timeout | null>();
    private roomCountdownTimerMap = new Map<string, NodeJS.Timeout | null>();

    prepareGame(room: Room) {
        const players: GamePlayer[] = random.shuffle(room.players).map((p) => ({ ...p, color: this.generateColor(), eliminated: false }));

        const imposters = random.shuffle([...players]).slice(0, room.settings.imposters);

        this.removeGame(room.roomId);

        this.roomMap.set(room.roomId, room);

        this.gamesMap.set(room.roomId, {
            players,
            round: 1,
            imposters,
            playing: false,
            currentIndex: 0,
            activePlayer: players[0],
            secretWord: random.choice(WORDS)!,
            remaining: room.settings.drawingTime,
            drawingTime: room.settings.drawingTime,
        });

        this.drawingStateMap.set(room.roomId, {
            turn: 0,
            strokes: [],
            undoHistory: [],
            redoHistory: [],
        });
    }

    revealRoles(roomId: string) {
        const game = this.getGame(roomId);

        if (!game) return;

        for (const { playerId } of game.players) {
            const isImposter = game.imposters.some((imposter) => imposter.playerId === playerId);

            const fellowImposters = isImposter ? game.imposters.filter((imposter) => imposter.playerId !== playerId).map(({ name }) => name) : [];

            this.socketIoService.emitTo("game:role", playerId, {
                fellowImposters,
                role: isImposter ? "imposter" : "civilian",
                secretWord: isImposter ? null : game.secretWord,
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

        const endTime = Date.now() + game.drawingTime * 1000;

        const emitRemaining = () => {
            const remaining = Math.ceil(Math.max(0, (endTime - Date.now()) / 1000));

            game.remaining = remaining;

            this.socketIoService.emitTo("game:timer", roomId, { remaining });

            if (remaining === 0) {
                this.clearTimers(roomId);
                this.next(roomId);
            }
        };

        emitRemaining();

        this.roomCountdownTimerMap.set(roomId, setInterval(emitRemaining, 1_000));
    }

    next(roomId: string, playerId?: string) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || !game.playing || !drawingState || (playerId && game.activePlayer.playerId !== playerId)) return;

        if (this.isVoting(roomId)) return;

        const alivePlayers = game.players.filter(({ eliminated }) => !eliminated);

        if (alivePlayers.length === 0) return;

        // Full round complete: every alive player has drawn once.
        if (drawingState.turn + 1 >= alivePlayers.length) {
            this.finalizeStrokes(roomId, drawingState);
            this.clearTimers(roomId);
            this.prepareVote(roomId);

            return;
        }

        let nextIndex = game.currentIndex;

        do {
            nextIndex = (nextIndex + 1) % game.players.length;
        } while (game.players[nextIndex]!.eliminated && nextIndex !== game.currentIndex);

        game.currentIndex = nextIndex;
        game.activePlayer = game.players[nextIndex]!;

        drawingState.turn += 1;

        this.finalizeStrokes(roomId, drawingState);
        this.socketIoService.emitTo("game:next_turn", roomId, { activePlayer: game.activePlayer, drawingState });

        this.clearTimers(roomId);
        this.startTimer(roomId);
    }

    prepareVote(roomId: string) {
        const game = this.getGame(roomId);

        if (!game) return;

        const votes: Vote[] = game.players.filter(({ eliminated }) => !eliminated).map(({ playerId }) => ({ submitted: false, voteeId: null, voterId: playerId }));

        const voteState: VotingState = {
            votes,
            result: null,
            phase: "intro",
            round: game.round,
            remaining: VOTING_DURATION,
        };

        this.voteStateMap.set(roomId, voteState);

        this.socketIoService.emitTo("game:voting:starting", roomId, { voteState });
    }

    startVoting(roomId: string, playerId: string) {
        const voteState = this.voteStateMap.get(roomId);

        if (!voteState || voteState.phase !== "intro") return;

        const game = this.getGame(roomId);
        const voter = game?.players.find(({ playerId: id }) => id === playerId);

        if (!voter || voter.eliminated) return;

        voteState.phase = "voting";

        const endTime = Date.now() + VOTING_DURATION * 1000;

        const emitRemaining = () => {
            const remaining = Math.ceil(Math.max(0, (endTime - Date.now()) / 1000));

            voteState.remaining = remaining;
            this.socketIoService.emitTo("game:voting:timer", roomId, { remaining });

            if (voteState.remaining === 0) {
                const timer = this.votingTimerMap.get(roomId);

                if (timer) {
                    clearInterval(timer);
                    this.votingTimerMap.delete(roomId);
                }

                this.generateResult(roomId);
            }
        };

        this.socketIoService.emitTo("game:voting:begin", roomId, { phase: "voting" });

        emitRemaining();

        this.votingTimerMap.set(roomId, setInterval(emitRemaining, 1_000));
    }

    votePlayer(roomId: string, voterId: string, targetId: string | null) {
        const game = this.getGame(roomId);
        const voteState = this.voteStateMap.get(roomId);

        if (!game || !voteState || voteState.phase !== "voting") return;

        const vote = voteState.votes.find(({ voterId: id }) => id === voterId);

        if (!vote || vote.submitted) return;

        const voter = game.players.find(({ playerId }) => playerId === voterId);

        if (!voter || voter.eliminated) return;

        if (targetId !== null) {
            if (targetId === voterId) return;

            const target = game.players.find(({ playerId }) => playerId === targetId);

            if (!target || target.eliminated) return;
        }

        vote.voteeId = targetId;
        vote.submitted = true;

        this.socketIoService.emitTo("game:voting:vote:updated", roomId, { votes: voteState.votes });

        const alivePlayers = game.players.filter(({ eliminated }) => !eliminated);
        const allSubmitted = voteState.votes.filter(({ voterId }) => alivePlayers.some((p) => p.playerId === voterId)).every(({ submitted }) => submitted);

        if (allSubmitted && voteState.phase === "voting") {
            const timer = this.votingTimerMap.get(roomId);
            if (timer) {
                clearInterval(timer);
                this.votingTimerMap.delete(roomId);
            }
            this.generateResult(roomId);
        }
    }

    generateResult(roomId: string) {
        const game = this.getGame(roomId);
        const voteState = this.voteStateMap.get(roomId);

        if (!game || !voteState || voteState.phase !== "voting") return;

        voteState.phase = "result";

        const voting = this.getMostVoted(voteState.votes);

        const alivePlayers = game.players.filter(({ eliminated }) => !eliminated);
        const requiredVotes = Math.floor(alivePlayers.length / 2) + 1;

        if (voting.playerId && !voting.tied && voting.count >= requiredVotes) {
            const player = game.players.find(({ playerId }) => playerId === voting.playerId);
            const isImposter = game.imposters.some((imposter) => imposter.playerId === player?.playerId);

            if (player && !player.eliminated) {
                game.players = game.players.map((p) => (player.playerId === p.playerId ? { ...p, eliminated: true } : p));

                voteState.result = {
                    name: player.name,
                    playerId: player.playerId,
                    role: isImposter ? "imposter" : "civilian",
                };
            }
        }

        this.clearVotingTimer(roomId);

        this.socketIoService.emitTo("game:voting:result", roomId, { phase: voteState.phase, result: voteState.result });
    }

    continueAfterResult(roomId: string) {
        const voteState = this.voteStateMap.get(roomId);

        if (!voteState || voteState.phase !== "result") return;

        this.checkWinCondition(roomId);
    }

    private checkWinCondition(roomId: string) {
        const game = this.getGame(roomId);
        const voteState = this.voteStateMap.get(roomId);

        if (!game || !voteState) return;

        const alive = game.players.filter(({ eliminated }) => !eliminated);

        const imposterIds = new Set(game.imposters.map(({ playerId }) => playerId));

        const aliveImposters = alive.filter(({ playerId }) => imposterIds.has(playerId)).length;
        const aliveCivilians = alive.length - aliveImposters;

        this.voteStateMap.delete(roomId);

        let winner: GameWinner | null = null;

        if (aliveImposters === 0) winner = "civilians";
        else if (aliveImposters >= aliveCivilians) winner = "imposters";

        if (winner) {
            game.playing = false;

            this.clearTimers(roomId);
            this.clearVotingTimer(roomId);

            this.socketIoService.emitTo("game:over", roomId, { winner, secretWord: game.secretWord });

            this.resetRoom(roomId);

            return;
        }

        this.startNextRound(roomId);
    }

    private startNextRound(roomId: string) {
        const game = this.getGame(roomId);
        const drawingState = this.drawingStateMap.get(roomId);

        if (!game || !drawingState) return;

        game.round += 1;

        drawingState.undoHistory = [];
        drawingState.redoHistory = [];
        drawingState.turn = 0;

        this.activeStrokesMap.get(roomId)?.clear();

        let nextIndex = game.currentIndex;

        do {
            nextIndex = (nextIndex + 1) % game.players.length;
        } while (game.players[nextIndex]!.eliminated && nextIndex !== game.currentIndex);

        game.currentIndex = nextIndex;
        game.activePlayer = game.players[nextIndex]!;
        game.playing = true;

        this.clearTimers(roomId);

        this.socketIoService.emitTo("game:state", roomId, { game, drawingState });

        this.startTimer(roomId);
    }

    removeGame(roomId: string) {
        this.clearTimers(roomId);
        this.clearVotingTimer(roomId);

        this.gamesMap.delete(roomId);
        this.voteStateMap.delete(roomId);
        this.drawingStateMap.delete(roomId);
        this.activeStrokesMap.delete(roomId);
        this.roomMap.delete(roomId);
    }

    private resetRoom(roomId: string) {
        const room = this.roomMap.get(roomId);

        this.removeGame(roomId);

        if (!room) return;

        room.status = "waiting";
        room.countdown = COUNTER_START_TIME;
        room.players = room.players.map(({ ...p }) => ({ ...p, ready: false }));

        this.socketIoService.emitTo("room:state", roomId, { room });
    }

    private getMostVoted(votes: Vote[]) {
        const counts = new Map<string, number>();

        for (const { submitted, voteeId } of votes) {
            if (!submitted || !voteeId) continue;

            counts.set(voteeId, (counts.get(voteeId) ?? 0) + 1);
        }

        let maxCount = 0;
        let top: string | null = null;
        let tied = false;

        for (const [playerId, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                top = playerId;
                tied = false;
            } else if (count === maxCount && playerId !== top) {
                tied = true;
            }
        }

        return { count: maxCount, playerId: top, tied };
    }

    getActiveStrokes(roomId: string) {
        return this.activeStrokesMap.get(roomId);
    }

    getDrawingState(roomId: string) {
        return this.drawingStateMap.get(roomId);
    }

    setActiveStrokes(roomId: string, activeStroke: Map<string, Stroke>) {
        return this.activeStrokesMap.set(roomId, activeStroke);
    }

    getGame(roomId: string) {
        return this.gamesMap.get(roomId);
    }

    private isVoting(roomId: string) {
        const voteState = this.voteStateMap.get(roomId);

        return !!voteState && voteState.phase !== "idle";
    }

    private finalizeStrokes(roomId: string, drawingState: DrawingState) {
        drawingState.strokes.forEach((stroke) => (stroke.active = false));

        this.activeStrokesMap.get(roomId)?.clear();
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

    private clearVotingTimer(roomId: string) {
        const timer = this.votingTimerMap.get(roomId);

        if (timer) {
            clearInterval(timer);
            this.votingTimerMap.delete(roomId);
        }
    }

    private generateColor() {
        return `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")}`;
    }
}
