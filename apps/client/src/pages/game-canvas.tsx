import DrawingBoard from "@/components/drawing-board";
import GameOver from "@/components/game-over";
import GameShell from "@/components/game-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Countdown } from "@/components/ui/countdown";
import VotingIntro from "@/components/voting-intro";
import VotingResult from "@/components/voting-result";
import VotingView from "@/components/voting-view";
import { useSocket } from "@/contexts/socket-context";
import useVoting from "@/hooks/custom/use-voting";
import { useGetRoom } from "@/hooks/tan-stack/room";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { getInitials } from "@/utils/helpers";
import { type DrawingState, type Game, type GameWinner, type Room } from "@package/types";
import { cn } from "cn";
import { LogOut, Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import NotFound from "./not-found";

export default function GameCanvasLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();

    const { data: room } = useGetRoom(roomId);

    if (!room) {
        return <NotFound />;
    }

    return <GameCanvasPage room={room} />;
}

function GameCanvasPage({ room }: { room: Room }) {
    const roomId = room.roomId;

    const { socket } = useSocket();
    const { data: player } = useGetOrCreateSession();

    const voting = useVoting({ roomId, socket, player });

    const [myTurn, setMyTurn] = useState(false);
    const [game, setGame] = useState<Game | null>(null);
    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [winner, setWinner] = useState<GameWinner | null>(null);
    const [secretWord, setSecretWord] = useState<string>("");

    const isImposter = !!game && !!player && game.imposters.some(({ playerId }) => playerId === player?.playerId);
    const isEliminated = !!game && !!player && !!game.players.find(({ playerId }) => playerId === player?.playerId)?.eliminated;
    const selectedVote = voting.targetId;

    useEffect(() => {
        if (!socket) return;

        socket.on("game:state", ({ game, drawingState }) => {
            setGame(game);
            setDrawingState(drawingState);
            setMyTurn(game.activePlayer.playerId === player?.playerId);
        });
        socket.on("game:round_count", ({ round, drawingState }) => {
            setDrawingState(drawingState);
            setGame((game) => (game ? { ...game, round } : game));
        });
        socket.on("game:timer", ({ remaining }) => setGame((game) => (game ? { ...game, remaining } : game)));
        socket.on("game:next_turn", ({ activePlayer, drawingState }) => {
            setDrawingState(drawingState);
            setMyTurn(activePlayer.playerId === player?.playerId);
            setGame((game) => (game ? { ...game, activePlayer } : game));
        });
        socket.on("game:over", ({ winner, secretWord }) => {
            setWinner(winner);
            setSecretWord(secretWord);
        });

        socket.emit("game:get:state", { roomId });

        return () => {
            socket.off("game:state");
            socket.off("game:timer");
            socket.off("game:next_turn");
            socket.off("game:round_count");
            socket.off("game:over");
        };
    }, [player?.playerId, roomId, socket]);

    if (winner) {
        return <GameOver winner={winner} secretWord={secretWord} roomId={roomId} />;
    }

    if (voting.state.phase === "intro") {
        return <VotingIntro onComplete={voting.completeIntro} />;
    }

    if (voting.state.phase === "result") {
        return <VotingResult result={voting.state.result} onComplete={voting.completeResult} />;
    }

    if (voting.state.phase === "voting") {
        return (
            <VotingView
                round={voting.state.round}
                selectedVote={selectedVote}
                onSelect={voting.selectVote}
                onSubmit={voting.submitVote}
                currentPlayerId={player?.playerId}
                remaining={voting.state.remaining}
                phase={voting.submitted || isEliminated ? "submitted" : "voting"}
                players={game ? game.players.filter(({ eliminated }) => !eliminated) : []}
            />
        );
    }

    return (
        <GameShell
            trailing={
                <Link to={`/room/${roomId}`}>
                    <Button variant="outline" size="lg" className="hover:text-primary gap-4 px-4 font-bold tracking-widest uppercase">
                        <LogOut className="size-4" />
                        LEAVE GAME
                    </Button>
                </Link>
            }
        >
            <section>
                <div className="bg-card/70 mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ROOM</span>
                        <span className="text-primary text-glow text-lg font-black tracking-[0.3em] sm:text-xl">{roomId}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">SKETCHY</span>
                        <span className="bg-primary/20 border-primary/40 text-primary border px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">IN GAME</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="hud-box bg-card col-span-1 flex flex-col overflow-hidden border border-slate-800 lg:col-span-3">
                        <div className="bg-card/60 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Paintbrush className="text-primary size-5" />
                                <Countdown label="ACTIVE DRAWER" value={game?.activePlayer.name ?? "..."} variant="danger" />
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {game ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-foreground/80 text-sm tracking-widest uppercase">Your role</span>
                                        <span
                                            className={cn(
                                                "rounded border px-3 py-1 text-lg font-bold tracking-wider",
                                                isImposter ? "border-accent-red/50 bg-accent-red/20 text-accent-red glow-red" : "border-accent-green/50 bg-accent-green/20 text-accent-green glow-green",
                                            )}
                                        >
                                            {isImposter ? "IMPOSTER" : "CIVILIAN"}
                                        </span>
                                    </div>
                                ) : null}

                                {game && !isImposter ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-foreground/80 text-sm tracking-widest uppercase">Secret word</span>
                                        <span className="text-accent-green text-glow-green text-lg font-bold tracking-widest uppercase">{game.secretWord}</span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-4">
                                <Countdown label="ROUND" value={game?.round.toString() ?? "1"} variant="danger" />
                                <Countdown label="TIME LEFT" value={game ? `00:${game.remaining.toString().padStart(2, "0")}` : "00:--"} variant="warning" />
                            </div>
                        </div>

                        <div className="flex h-120 min-h-95 flex-col lg:h-150">
                            <DrawingBoard myTurn={myTurn} roomId={roomId} drawingState={drawingState} setDrawingState={setDrawingState} />
                        </div>
                    </div>

                    <aside className="col-span-1 space-y-4">
                        {game && isImposter ? (
                            <div className="bg-card border-accent-red/40 border p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="text-accent-red glow-red size-1.5 rounded-full bg-current" />
                                    <span className="text-accent-red text-xs font-bold tracking-widest uppercase">Your fellow imposters</span>
                                </div>
                                <div className="space-y-2">
                                    {game.imposters
                                        .filter(({ playerId }) => playerId !== player?.playerId)
                                        .map((p) => (
                                            <div key={p.playerId} className="bg-accent-red/5 border-accent-red/20 flex items-center justify-between border px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-accent-red/20 text-accent-red border-accent-red/40 flex size-7 items-center justify-center border text-[10px] font-black">{getInitials(p.name)}</div>
                                                    <span className="text-accent-red text-xs font-bold tracking-wide uppercase">{p.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-slate-500">{game.imposters.length > 1 ? "Stay quiet. They are the only ones you can trust." : "You are alone. Bluff hard and find the word."}</p>
                            </div>
                        ) : null}

                        <div className="bg-card border border-slate-800 p-4">
                            <div className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">PLAYERS</div>
                            <div className="space-y-2">
                                {game?.players.map((p) => {
                                    const drawing = p.playerId === game?.activePlayer.playerId;
                                    const eliminated = p.eliminated;

                                    return (
                                        <div key={p.name} className={cn("bg-background/40 flex items-center justify-between border px-3 py-2", eliminated ? "border-accent-red/30 opacity-60" : "border-slate-800")}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "flex size-7 items-center justify-center border text-[10px] font-black",
                                                        eliminated ? "border-accent-red/40 bg-accent-red/10 text-accent-red/70" : drawing ? "border-primary/60 bg-primary/10 text-primary" : "bg-background/60 border-slate-700 text-slate-400",
                                                    )}
                                                >
                                                    {getInitials(p.name)}
                                                </div>
                                                <span className={cn("text-xs font-bold tracking-wide uppercase", eliminated ? "text-accent-red/70 line-through" : drawing ? "text-primary" : "text-slate-300")}>{p.name}</span>
                                            </div>
                                            <Chip variant={eliminated ? "danger" : "default"} selected={drawing && !eliminated} size="sm">
                                                {eliminated ? "ELIMINATED" : drawing ? "DRAWING" : "GUESSING"}
                                            </Chip>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-card border border-slate-800 p-4">
                            <div className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">DRAWING TOOLS</div>
                            <p className="text-xs text-slate-500">Pen, Eraser, Sizes, Undo, Redo, Clear are built into the canvas toolbar.</p>
                        </div>
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
