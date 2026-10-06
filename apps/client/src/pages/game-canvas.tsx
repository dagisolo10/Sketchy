import IntroPage from "./intro";
import NotFound from "./not-found";

import DrawingCanvas from "@/components/drawing-canvas";
import GameShell from "@/components/game-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Countdown } from "@/components/ui/countdown";
import { useSocket } from "@/contexts/socket-context";
import { useGetRoom } from "@/hooks/tan-stack/room";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { getInitials } from "@/utils/helpers";
import { DRAWING_DURATION, type Game, type Role, type Room } from "@package/types";
import { cn } from "cn";
import { LogOut, Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function GameCanvasLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();

    const { data: room } = useGetRoom(roomId);

    if (!room) {
        return <NotFound />;
    }

    return <GameCanvasPage room={room} />;
}

function GameCanvasPage({ room }: { room: Room }) {
    const { socket } = useSocket();
    const { data: player } = useGetOrCreateSession();

    const [round, setRound] = useState(1);
    const [myTurn, setMyTurn] = useState(false);
    const [role, setRole] = useState<Role>("imposter");
    const [game, setGame] = useState<Game | null>(null);
    const [introFinished, setIntroFinished] = useState(false);
    const [remaining, setRemaining] = useState(DRAWING_DURATION);
    const [secretWord, setSecretWord] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("game:state", ({ game }) => setGame(game));
        socket.on("game:round_count", ({ round }) => setRound(round));
        socket.on("game:timer", ({ remaining }) => setRemaining(remaining));
        socket.on("game:next_turn", ({ activePlayer }) => {
            setGame((game) => (game ? { ...game, activePlayer } : game));
            setMyTurn(activePlayer.playerId === player?.playerId);
        });
        socket.on("game:role", ({ role, secretWord }) => {
            setRole(role);
            setSecretWord(secretWord);
        });

        socket.emit("game:reveal:role", { roomId: room.roomId });
        socket.emit("game:get:state", { roomId: room.roomId });

        return () => {
            socket.off("game:role");
            socket.off("game:state");
        };
    }, [player?.playerId, room.roomId, socket]);

    if (!introFinished) {
        return (
            <IntroPage
                role={role}
                secretWord={secretWord}
                onComplete={() => {
                    setIntroFinished(true);
                    if (socket) socket.emit("game:started", { roomId: room.roomId });
                }}
            />
        );
    }

    return (
        <GameShell
            trailing={
                <Link to={`/room/${room.roomId}`}>
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
                        <span className="text-primary text-glow text-lg font-black tracking-[0.3em] sm:text-xl">{room.roomId}</span>
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
                                <Countdown label="ACTIVE DRAWER" value={game?.activePlayer?.name ?? "..."} variant="danger" />
                            </div>

                            <div className="flex items-center gap-4">
                                <Countdown label="ROUND" value={round.toString()} variant="danger" />
                                <Countdown label="TIME LEFT" value={`00:${remaining.toString().padStart(2, "0")}`} variant="warning" />
                            </div>
                        </div>

                        <div className="flex h-[calc(100vh-20rem)] min-h-95 flex-col lg:h-[calc(100vh-14rem)]">
                            <DrawingCanvas myTurn={myTurn} />
                        </div>
                    </div>

                    <aside className="col-span-1 space-y-4">
                        <div className="bg-card border border-slate-800 p-4">
                            <div className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">PLAYERS</div>
                            <div className="space-y-2">
                                {game?.players.map((p) => {
                                    const drawing = p.playerId === game.activePlayer.playerId;

                                    return (
                                        <div key={p.name} className="bg-background/40 flex items-center justify-between border border-slate-800 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "flex size-7 items-center justify-center border text-[10px] font-black",
                                                        drawing ? "border-primary/60 bg-primary/10 text-primary" : "bg-background/60 border-slate-700 text-slate-400",
                                                    )}
                                                >
                                                    {getInitials(p.name)}
                                                </div>
                                                <span className={cn("text-xs font-bold tracking-wide uppercase", drawing ? "text-primary" : "text-slate-300")}>{p.name}</span>
                                            </div>
                                            <Chip variant={drawing ? "default" : "default"} selected={drawing} size="sm">
                                                {drawing ? "DRAWING" : "GUESSING"}
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
