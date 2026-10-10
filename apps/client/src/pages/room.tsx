import { useGetRoom, useJoinRoom, useLeaveRoom, usePlayerReady, useStartGame, useUpdateRoomSettings } from "@/hooks/tan-stack/room";
import { MIN_PLAYERS, type Room, type RoomSettings } from "@package/types";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { Check, Copy, LogOut, Play, Save } from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/contexts/socket-context";
import { useNavigate, useParams } from "react-router";
import { Countdown } from "@/components/ui/countdown";
import { useToast } from "@/contexts/toast-context";
import PlayerCard from "@/components/player-card";
import GameShell from "@/components/game-shell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import { cn } from "cn";


export default function RoomPageLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();

    const { data: room } = useGetRoom(roomId);

    if (!room) {
        return <NotFound />;
    }

    return <RoomPage room={room} />;
}

function RoomPage({ room }: { room: Room }) {
    const roomId = room.roomId;
    const toast = useToast();
    const router = useNavigate();

    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const { data: player } = useGetOrCreateSession();
    const updateRoomSettingsMt = useUpdateRoomSettings({ onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to update room settings" }) });
    const joinRoomMt = useJoinRoom({ onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to join room" }) });
    const startGameMt = useStartGame({ onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to start game" }) });
    const playerReadyMt = usePlayerReady({ onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to change ready" }) });
    const leaveRoomMt = useLeaveRoom({ onSuccess: () => router("/play"), onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to leave room" }) });

    const [ready, setReady] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [settings, setSettings] = useState<RoomSettings>(room.settings);

    const hasChanges = settings.maxPlayers !== room.settings.maxPlayers || settings.drawingTime !== room.settings.drawingTime || settings.imposters !== room.settings.imposters;

    const rules = [
        { label: "Max Players", value: settings.maxPlayers, valueLabel: "Players", min: 2, step: 1, onChange: (val: number) => setSettings((s) => ({ ...s, maxPlayers: val })) },
        { label: "Drawing Time", value: settings.drawingTime, valueLabel: "Secs", min: 30, step: 10, onChange: (val: number) => setSettings((s) => ({ ...s, drawingTime: val })) },
        { label: "Imposter Count", value: settings.imposters, valueLabel: "Imposters", min: 1, step: 1, onChange: (val: number) => setSettings((s) => ({ ...s, imposters: val })) },
    ];

    const isHost = player?.playerId === room.hostId;
    const readyCount = room.players.filter(({ ready }) => ready).length;
    const playerCount = room.players.length >= MIN_PLAYERS ? room.players.length : 3;
    const isPlayerInRoom = room.players.some(({ playerId }) => playerId === player?.playerId);
    const canStart = room.players.length >= MIN_PLAYERS && room.players.every(({ ready }) => ready);

    useEffect(() => {
        if (!roomId || isPlayerInRoom || !player?.playerId) return;

        joinRoomMt.mutate({ roomId });
    }, [isPlayerInRoom, joinRoomMt, player?.playerId, roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("room:state", ({ room }) => {
            queryClient.setQueryData<Room>(["room", roomId], room);

            if (room.status === "playing") {
                router(`/room/${roomId}/game`);
            }
        });
        socket.on("room:game:intro:started", ({ roomId }) => router(`/room/${roomId}/intro`));
        socket.on("room:game:starting", ({ status }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, status } : room));
        });
        socket.on("room:settings:updated", ({ settings }) => {
            setSettings(settings);
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, ...settings } : room));
        });
        socket.on("room:game:countdown", ({ countdown, roomId }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, countdown } : room));
        });
        socket.on("player:joined", ({ player }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, players: [...room.players, player] } : room));
        });
        socket.on("player:left:room", ({ playerId }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, players: room.players.filter((p) => p.playerId !== playerId) } : room));
        });
        socket.on("player:ready:updated", ({ player }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, players: room.players.map((p) => (p.playerId === player.playerId ? player : p)) } : room));
        });

        socket.emit("room:joined", { roomId });
        socket.emit("room:get:state", { roomId });

        return () => {
            socket.off("room:state");
            socket.off("player:joined");
            socket.off("player:left:room");
            socket.off("room:game:starting");
            socket.off("room:game:countdown");
            socket.off("player:ready:updated");
            socket.off("room:settings:updated");
            socket.off("room:game:intro:started");

            // add leaving room if path is before room page
        };
    }, [queryClient, roomId, router, socket]);

    function updateReadyState() {
        const nextReady = !ready;

        setReady(nextReady);

        playerReadyMt.mutate({ roomId, ready: nextReady });
    }

    async function copyRoomCode() {
        await window.navigator.clipboard.writeText(roomId);

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    function handleSave() {
        if (!hasChanges || !isHost) return;

        updateRoomSettingsMt.mutate({ roomId, ...settings });
    }

    return (
        <GameShell
            trailing={
                <Button size="lg" variant="outline" disabled={leaveRoomMt.isPending} onClick={() => leaveRoomMt.mutate({ roomId })} className="hover:text-primary gap-4 px-4 font-bold tracking-widest uppercase">
                    <LogOut className="size-4" />
                    LEAVE ROOM
                </Button>
            }
        >
            <section className="pt-10 pb-16">
                <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                        <div className="text-primary text-xl font-bold tracking-widest uppercase">PRIVATE LOBBY</div>

                        <h1 className="text-4xl font-black tracking-tight uppercase sm:text-6xl">
                            ROOM: <span className="text-glow text-primary">{roomId}</span>
                        </h1>
                    </div>

                    <div className="bg-card flex items-center gap-4 border border-slate-800 px-5 py-4">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ROOM CODE</span>
                        <span className="text-primary text-glow text-2xl font-black tracking-[0.3em]">{roomId}</span>
                        <Button size="sm" variant="outline" title="Copy room link" onClick={copyRoomCode} className="hover:border-primary hover:text-primary gap-2 rounded-none border-slate-800 font-bold tracking-widest uppercase">
                            {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            {isCopied ? "COPIED" : "COPY"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="bg-card flex flex-col gap-6 border border-slate-800 p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">PLAYERS READY</div>
                                <div className={cn(canStart ? "text-accent-green text-glow-green" : "text-primary text-glow", "text-4xl font-black tabular-nums")}>
                                    {readyCount} / {playerCount}
                                </div>
                                <div className={cn(canStart ? "text-accent-green" : "text-accent-amber", "font-bold tracking-widest uppercase")}>{canStart ? "EVERYONE IS READY" : "WAITING FOR EVERYONE TO READY UP"}</div>
                            </div>

                            <div className="flex flex-col items-start gap-4 lg:w-56 lg:items-end">
                                <Button size="lg" onClick={updateReadyState} className="glow-primary h-14 w-full gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase">
                                    <Play className="fill-background text-background size-4" />
                                    READY
                                </Button>

                                <div className="flex h-2 w-full gap-1.5">
                                    {Array.from({ length: playerCount }).map((_, index) => (
                                        <div key={`progress-${index}`} className="relative h-full flex-1 overflow-hidden border border-slate-800 bg-slate-900/80">
                                            <div className="bg-primary glow-primary-sm h-full transition-[width] duration-500 ease-out" style={{ width: index < readyCount ? "100%" : "0%" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {room.players.map((player) => (
                                <PlayerCard key={player.playerId} player={player} host={player.playerId === room.hostId} />
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        {isHost && (
                            <Button size="lg" disabled={!canStart || room.status === "starting"} onClick={() => startGameMt.mutate({ roomId })} className="glow-primary h-14 w-full gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase">
                                <Play className="fill-background text-background size-4" />
                                START GAME
                            </Button>
                        )}

                        <div className="bg-card hud-box relative border border-slate-800 p-5">
                            <div className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">ROOM RULES</div>

                            <ul className="space-y-2.5">
                                {rules.map(({ label, value, valueLabel, min, step, onChange }) => (
                                    <li key={label} className="bg-background/40 flex items-center justify-between border border-slate-800/80 px-4 py-2.5">
                                        <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">{label}</span>

                                        <div className="flex items-center gap-3">
                                            {isHost && <NumberInput disabled={!isHost || updateRoomSettingsMt.isPending} min={min} step={step} value={value} onChange={onChange} />}

                                            <span className="text-primary text-base font-black tracking-wider uppercase">
                                                {value}
                                                <span className="ml-1 text-xs text-slate-400">{valueLabel}</span>
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {isHost && (
                                <Button size="lg" disabled={!hasChanges || updateRoomSettingsMt.isPending} onClick={handleSave} className="glow-primary h-14 w-full gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase">
                                    <Save className="size-4" />
                                    {updateRoomSettingsMt.isPending ? "SAVING..." : "UPDATE SETTINGS"}
                                </Button>
                            )}
                        </div>

                        {room.status === "starting" && <Countdown variant="warning" label="GAME STARTS IN" value={`00:${room.countdown.toString().padStart(2, "0")}`} className="bg-card flex-1 justify-between border border-slate-800 p-4" />}
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
