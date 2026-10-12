import DrawingBoard from "@/components/drawing-board";
import GameError from "@/components/errors/game-error";
import GameOver from "@/components/game-over";
import GameShell from "@/components/game-shell";
import GameSkeleton from "@/components/skeletons/game-skeleton";
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
import { LogOut, Paintbrush, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function GameCanvasLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();
    const { data: room, isPending, error, refetch, isFetching } = useGetRoom(roomId);

    if (isPending) {
        return <GameSkeleton />;
    }

    if (error) {
        return <GameError error={error} onRetry={() => refetch()} retrying={isFetching} />;
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

    const [mobileTab, setMobileTab] = useState<"canvas" | "players">("canvas");

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
                    <Button variant="outline" size="sm" className="w-full gap-2 px-3 font-mono text-xs font-bold tracking-widest uppercase md:w-auto">
                        <LogOut className="size-3.5" />
                        LEAVE
                    </Button>
                </Link>
            }
        >
            <section className="space-y-4">
                <div className="border-line border-border bg-card/70 shadow-nb flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase sm:text-xs">ROOM</span>
                        <span className="text-primary-ink text-glow font-display text-base font-black tracking-[0.2em] sm:text-xl">{roomId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="border-primary/40 bg-primary/20 text-primary-ink border-line rounded-xs px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">IN GAME</span>
                    </div>
                </div>

                <div className="border-border bg-card shadow-nb-xs flex rounded-md border p-1 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileTab("canvas")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xs py-2 font-mono text-xs font-bold uppercase transition-all",
                            mobileTab === "canvas" ? "bg-primary text-primary-foreground shadow-nb-xs" : "text-muted-foreground",
                        )}
                    >
                        <Paintbrush className="size-3.5" />
                        Canvas
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab("players")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xs py-2 font-mono text-xs font-bold uppercase transition-all",
                            mobileTab === "players" ? "bg-primary text-primary-foreground shadow-nb-xs" : "text-muted-foreground",
                        )}
                    >
                        <Users className="size-3.5" />
                        Players ({game?.players.length ?? 0})
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className={cn("hud-box border-line border-border bg-card shadow-nb col-span-1 flex flex-col overflow-hidden lg:col-span-3", mobileTab === "canvas" ? "block" : "hidden lg:flex")}>
                        <div className="border-border/60 grid grid-cols-2 gap-3 border-b p-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
                            <div className="border-border/40 col-span-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 sm:col-span-1 sm:border-0 sm:pt-0">
                                <div className="flex items-center gap-2">
                                    <Paintbrush className="text-primary-ink size-4 shrink-0 sm:size-5" />
                                    <Countdown label="DRAWER" value={game?.activePlayer.name ?? "..."} />
                                </div>

                                <Countdown label="TIME" value={game ? `00:${game.remaining.toString().padStart(2, "0")}` : "00:--"} variant="warning" />
                            </div>

                            <div className="border-border/40 col-span-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 sm:col-span-1 sm:border-0 sm:pt-0">
                                <Countdown label="ROUND" value={game?.round.toString() ?? "1"} variant="danger" />
                                {game && <Countdown label="ROLE" value={isImposter ? "IMPOSTER" : "CIVILIAN"} />}
                                {game && !isImposter && <Countdown textClassName="uppercase" label="WORD" value={game.secretWord} variant="success" />}
                            </div>
                        </div>

                        <div className="flex h-[55vh] min-h-90 flex-col sm:h-[65vh] lg:h-[calc(100vh-280px)]">
                            <DrawingBoard myTurn={myTurn} roomId={roomId} drawingState={drawingState} setDrawingState={setDrawingState} />
                        </div>
                    </div>

                    <aside className={cn("col-span-1 space-y-4", mobileTab === "players" ? "block" : "hidden lg:block")}>
                        {game && isImposter ? (
                            <div className="border-line border-danger/40 bg-card shadow-nb p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="text-danger size-2 animate-pulse rounded-full bg-current" />
                                    <span className="text-danger font-mono text-xs font-bold tracking-widest uppercase">Fellow Imposters</span>
                                </div>
                                <div className="space-y-2">
                                    {game.imposters
                                        .filter(({ playerId }) => playerId !== player?.playerId)
                                        .map((p) => (
                                            <div key={p.playerId} className="bg-danger/5 border-danger/20 flex items-center justify-between border px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="border-danger/40 bg-danger/20 text-danger flex size-7 items-center justify-center border font-mono text-[10px] font-black">{getInitials(p.name)}</div>
                                                    <span className="text-danger font-mono text-sm font-bold tracking-wide uppercase">{p.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <p className="text-muted-foreground mt-3 font-sans text-xs leading-relaxed">{game.imposters.length > 1 ? "Stay quiet. They are the only ones you can trust." : "You are alone. Bluff hard and find the word."}</p>
                            </div>
                        ) : null}

                        {game?.players.map((p) => {
                            const drawing = p.playerId === game?.activePlayer.playerId;
                            const eliminated = p.eliminated;

                            return (
                                <div key={p.name} className={cn("border-line flex items-center justify-between border px-3 py-2 transition-all", eliminated ? "border-danger/30 bg-danger/5 opacity-60" : "border-border bg-background/40")}>
                                    <div className="flex items-center gap-2.5 truncate">
                                        <div
                                            className={cn(
                                                "flex size-7 shrink-0 items-center justify-center border font-mono text-[10px] font-black",
                                                eliminated ? "border-danger/40 bg-danger/10 text-danger/70" : drawing ? "border-primary/60 bg-primary/10 text-primary-ink" : "border-border/70 bg-background/60 text-muted-foreground",
                                            )}
                                        >
                                            {getInitials(p.name)}
                                        </div>

                                        <div className="flex items-center gap-2 truncate">
                                            <span className={cn("truncate font-mono text-sm font-bold tracking-wide uppercase", eliminated ? "text-danger/70 line-through" : drawing ? "text-primary-ink" : "text-foreground/80")}>{p.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Chip variant={eliminated ? "danger" : "default"} selected={drawing && !eliminated} size="sm" className="shrink-0 font-mono text-[10px]">
                                            {eliminated ? "ELIMINATED" : drawing ? "DRAWING" : "GUESSING"}
                                        </Chip>
                                        {p.color && !eliminated && <span className="border-border shadow-nb-xs size-2.5 shrink-0 rounded-full border" style={{ backgroundColor: p.color }} title={`Color: ${p.color}`} />}
                                    </div>
                                </div>
                            );
                        })}
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
