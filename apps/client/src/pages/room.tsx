import GameShell from "@/components/game-shell";
import PlayerCard from "@/components/player-card";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { NumberInput } from "@/components/ui/number-input";
import { useGetRoom, useLeaveRoom } from "@/hooks/tan-stack/room";
import NotFound from "@/pages/not-found";
import type { Player, Room } from "@package/types";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { Copy, LogOut, Play } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";

export default function RoomPageLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();

    const { data: room } = useGetRoom(roomId);

    if (!room) {
        return <NotFound />;
    }

    return <RoomPage room={room} />;
}

function RoomPage({ room }: { room: Room }) {
    const queryClient = useQueryClient();
    const player = queryClient.getQueryData<Player>(["session"]);

    const leaveRoomMt = useLeaveRoom();

    const players = room.players;
    const [playerCount, setPlayerCount] = useState(players.length);

    const everyoneReady = playerCount === players.length;

    const isHost = player?.playerId === room.hostId;

    return (
        <GameShell
            trailing={
                <Link to="/play">
                    <Button
                        size="lg"
                        variant="outline"
                        disabled={leaveRoomMt.isPending}
                        onClick={async () => await leaveRoomMt.mutateAsync({ roomId: room.roomId })}
                        className="hover:text-primary gap-4 px-4 font-bold tracking-widest uppercase"
                    >
                        <LogOut className="size-4" />
                        LEAVE ROOM
                    </Button>
                </Link>
            }
        >
            <section className="pt-10 pb-16">
                <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                        <div className="text-primary text-xl font-bold tracking-widest uppercase">PRIVATE LOBBY</div>

                        <h1 className="text-4xl font-black tracking-tight uppercase sm:text-6xl">
                            ROOM: <span className="text-glow text-primary">{room.roomId}</span>
                        </h1>
                    </div>

                    <div className="bg-card flex items-center gap-4 border border-slate-800 px-5 py-4">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ROOM CODE</span>
                        <span className="text-primary text-glow text-2xl font-black tracking-[0.3em]">{room.roomId}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            title="Copy room link"
                            className="hover:border-primary hover:text-primary gap-2 rounded-none border-slate-800 font-bold tracking-widest uppercase"
                        >
                            <Copy className="size-3.5" />
                            COPY
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="bg-card flex flex-col gap-6 border border-slate-800 p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">PLAYERS READY</div>
                                <div className={cn(everyoneReady ? "text-accent-green text-glow-green" : "text-primary text-glow", "text-4xl font-black tabular-nums")}>
                                    {playerCount} / {playerCount}
                                </div>
                                <div className={cn(everyoneReady ? "text-accent-green" : "text-accent-amber", "font-bold tracking-widest uppercase")}>
                                    {everyoneReady ? "EVERYONE IS READY" : "WAITING FOR EVERYONE TO READY UP"}
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-4 lg:w-56 lg:items-end">
                                <Button
                                    size="lg"
                                    onClick={() => setPlayerCount((count) => (count + 1 > 6 ? 0 : count + 1))}
                                    className="glow-primary h-14 w-full gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase"
                                >
                                    <Play className="fill-background text-background size-4" />
                                    READY
                                </Button>

                                <div className="flex h-2 w-full gap-1.5">
                                    {Array.from({ length: playerCount }).map((_, index) => (
                                        <div key={`progress-${index}`} className="relative h-full flex-1 overflow-hidden border border-slate-800 bg-slate-900/80">
                                            <div className="bg-primary glow-primary-sm h-full transition-[width] duration-500 ease-out" style={{ width: index < playerCount ? "100%" : "0%" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {players.map((player) => (
                                <PlayerCard key={player.playerId} player={player} host={isHost} />
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        {!isHost && (
                            <Link to={"/game/" + room.roomId}>
                                <Button disabled={!everyoneReady} size="lg" className="glow-primary h-14 w-full gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase">
                                    <Play className="fill-background text-background size-4" />
                                    START GAME
                                </Button>
                            </Link>
                        )}

                        <RoomRulesCard />

                        {everyoneReady && <Countdown label="GAME STARTS IN" value="00:30" variant="warning" className="bg-card flex-1 justify-between border border-slate-800 p-4" />}
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}

function RoomRulesCard() {
    const [playerLimit, setPlayerLimit] = useState(6);
    const [drawingTime, setDrawingTime] = useState(30);
    const [imposterCount, setImposterCount] = useState(1);

    const rules = [
        { label: "MAX PLAYERS", value: playerLimit, valueLabel: "PLAYERS", min: 1, step: 1, onChange: setPlayerLimit },
        { label: "DRAWING TIME", value: drawingTime, valueLabel: "S", min: 10, step: 5, onChange: setDrawingTime },
        { label: "IMPOSTERS", value: imposterCount, valueLabel: "IMPOSTER", min: 1, step: 1, onChange: setImposterCount },
    ];

    return (
        <div className="bg-card hud-box relative border border-slate-800 p-5">
            <div className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">ROOM RULES</div>

            <ul className="space-y-2.5">
                {rules.map(({ label, value, valueLabel, min, step, onChange }) => (
                    <li key={label} className="bg-background/40 flex items-center justify-between border border-slate-800/80 px-4 py-2.5">
                        <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">{label}</span>

                        <div className="flex items-center gap-3">
                            <span className="text-primary text-base font-black tracking-wider uppercase">
                                {value}
                                <span className="ml-1 text-xs text-slate-400">{valueLabel}</span>
                            </span>

                            <NumberInput min={min} step={step} value={value} onChange={onChange} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
