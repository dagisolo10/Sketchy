import { cn } from "cn";
import { Chip } from "@/components/ui/chip";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game-shell";
import { LogOut, Paintbrush } from "lucide-react";
import { Countdown } from "@/components/ui/countdown";
import DrawingCanvas from "@/components/drawing-canvas";

const MOCK_PLAYERS = [
    { name: "Dagmawi", initials: "DA", drawing: true, connection: 96 },
    { name: "Ayakashi", initials: "AY", drawing: false, connection: 90 },
    { name: "Natty", initials: "NA", drawing: false, connection: 82 },
    { name: "Samuel", initials: "SA", drawing: false, connection: 88 },
    { name: "Mike", initials: "MI", drawing: false, connection: 76 },
    { name: "Alex", initials: "AL", drawing: false, connection: 70 },
];

export default function GameCanvasPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const roomCode = (roomId ?? "SK8Y4").toUpperCase();
    const drawer = MOCK_PLAYERS.find((p) => p.drawing);

    return (
        <GameShell
            trailing={
                <Link to="/room/SK8Y4">
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
                        <span className="text-primary text-glow text-lg font-black tracking-[0.3em] sm:text-xl">{roomCode}</span>
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
                                <Paintbrush className="text-primary size-4" />
                                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ACTIVE DRAWER</span>
                                <span className="text-primary text-sm font-black tracking-wide uppercase">{drawer?.name ?? "..."}</span>
                            </div>
                            <Countdown label="TIME LEFT" value="00:30" variant="warning" />
                        </div>

                        <div className="flex h-[calc(100vh-20rem)] min-h-95 flex-col lg:h-[calc(100vh-14rem)]">
                            <DrawingCanvas />
                        </div>
                    </div>

                    <aside className="col-span-1 space-y-4">
                        <div className="bg-card border border-slate-800 p-4">
                            <div className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">PLAYERS</div>
                            <div className="space-y-2">
                                {MOCK_PLAYERS.map((p) => (
                                    <div key={p.name} className="bg-background/40 flex items-center justify-between border border-slate-800 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex size-7 items-center justify-center border text-[10px] font-black",
                                                    p.drawing ? "border-primary/60 bg-primary/10 text-primary" : "bg-background/60 border-slate-700 text-slate-400",
                                                )}
                                            >
                                                {p.initials}
                                            </div>
                                            <span className={cn("text-xs font-bold tracking-wide uppercase", p.drawing ? "text-primary" : "text-slate-300")}>{p.name}</span>
                                        </div>
                                        <Chip variant={p.drawing ? "default" : "default"} selected={p.drawing} size="sm">
                                            {p.drawing ? "DRAWING" : "GUESSING"}
                                        </Chip>
                                    </div>
                                ))}
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
