import RoomError from "@/components/errors/room-error";
import GameShell from "@/components/game-shell";
import PlayerCard from "@/components/player-card";
import RoomSkeleton from "@/components/skeletons/room-skeleton";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { NumberInput } from "@/components/ui/number-input";
import { useSocket } from "@/contexts/socket-context";
import { useToast } from "@/contexts/toast-context";
import { useGetRoom, useJoinRoom, useLeaveRoom, usePlayerReady, useStartGame, useUpdateRoomSettings } from "@/hooks/tan-stack/room";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { MIN_PLAYERS, type Room, type RoomSettings } from "@package/types";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { Check, Copy, LogOut, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function RoomPageLayout() {
    const { roomId = "" } = useParams<{ roomId: string }>();

    const { data: room, isPending, error, refetch, isFetching } = useGetRoom(roomId);

    if (isPending) {
        return <RoomSkeleton />;
    }

    if (error) {
        return <RoomError error={error} onRetry={() => refetch()} retrying={isFetching} />;
    }

    return <RoomPage room={room} />;
}

function RoomPage({ room }: { room: Room }) {
    const roomId = room.roomId;
    const { addToast } = useToast();
    const router = useNavigate();

    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const { data: player } = useGetOrCreateSession();
    const updateRoomSettingsMt = useUpdateRoomSettings({
        onSuccess: () => addToast({ variant: "success", title: "Room settings saved" }),
        onError: (err) => addToast({ variant: "error", description: err.message, title: "Failed to update room settings" }),
    });
    const joinRoomMt = useJoinRoom({
        onSuccess: () => addToast({ variant: "success", title: "Joined the room" }),
        onError: (err) => addToast({ variant: "error", description: err.message, title: "Failed to join room" }),
    });
    const startGameMt = useStartGame({
        onSuccess: () => addToast({ variant: "success", title: "Starting the game", description: "Get ready to draw!" }),
        onError: (err) => addToast({ variant: "error", description: err.message, title: "Failed to start game" }),
    });
    const playerReadyMt = usePlayerReady({
        onSuccess: (_data, variables) => addToast({ variant: "success", title: variables.ready ? "You're ready" : "Ready cancelled" }),
        onError: (err) => addToast({ variant: "error", description: err.message, title: "Failed to change ready" }),
    });
    const leaveRoomMt = useLeaveRoom({
        onSuccess: () => {
            addToast({ variant: "success", title: "Left the room" });
            router("/play");
        },
        onError: (err) => addToast({ variant: "error", description: err.message, title: "Failed to leave room" }),
    });

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
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, settings } : room));
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
        socket.on("player:ping:updated", ({ playerId, ping }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, players: room.players.map((p) => (p.playerId === playerId ? { ...p, ping } : p)) } : room));
        });
        socket.on("room:host:changed", ({ newHostId }) => {
            queryClient.setQueryData<Room>(["room", roomId], (room) => (room ? { ...room, hostId: newHostId } : room));

            if (newHostId === player?.playerId) {
                addToast({ variant: "success", title: "You're now the host", description: "The previous host left. Lobby controls are yours." });
            }
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
            socket.off("player:ping:updated");
            socket.off("room:settings:updated");
            socket.off("room:host:changed");
            socket.off("room:game:intro:started");
        };
    }, [player?.playerId, queryClient, roomId, router, socket, addToast]);

    function updateReadyState() {
        const nextReady = !ready;

        setReady(nextReady);

        playerReadyMt.mutate({ roomId, ready: nextReady });
    }

    async function copyRoomCode() {
        try {
            await window.navigator.clipboard.writeText(roomId);

            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            addToast({
                variant: "error",
                title: "Failed to copy room code",
                description: error instanceof Error ? error.message : "Enable clipboard permission",
            });
        }
    }

    function handleSave() {
        if (!hasChanges || !isHost) return;

        updateRoomSettingsMt.mutate({ roomId, ...settings });
    }

    return (
        <GameShell
            trailing={
                <Button loading={leaveRoomMt.isPending} onClick={() => leaveRoomMt.mutate({ roomId })} variant="outline" size="sm" className="w-full gap-2 px-3 text-xs uppercase md:w-auto">
                    <LogOut className="size-4" />
                    LEAVE ROOM
                </Button>
            }
        >
            <section>
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <div className="border-line border-warning/50 bg-warning/10 text-warning shadow-nb-xs inline-block px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase">Private lobby</div>

                        <h1 className="font-display text-4xl font-black tracking-tight uppercase sm:text-6xl">
                            GAME <span className="text-primary-ink text-glow">LOBBY</span>
                        </h1>
                    </div>

                    <div className="border-line border-border bg-card shadow-nb flex items-center gap-8 px-5 py-3.5">
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground text-sm font-bold tracking-widest uppercase">ROOM CODE</span>
                            <span className="text-primary-ink text-glow font-display font-black tracking-[0.25em] sm:text-2xl">{roomId}</span>
                        </div>

                        <Button size="sm" variant="outline" title="Copy room link" onClick={copyRoomCode} className="ml-auto gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                            {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            {isCopied ? "COPIED" : "COPY"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="border-line border-border bg-card shadow-nb flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">PLAYERS READY</p>
                                <p className={cn(canStart ? "text-success text-glow-green" : "text-primary-ink text-glow", "text-4xl font-black tabular-nums")}>
                                    {readyCount} / {playerCount}
                                </p>
                                <p className={cn(canStart ? "text-success" : "text-warning", "text-xs font-bold tracking-widest uppercase sm:text-base")}>{canStart ? "EVERYONE IS READY" : "WAITING FOR EVERYONE TO READY UP"}</p>
                            </div>

                            <div className="flex flex-col items-start gap-4 lg:w-56 lg:items-end">
                                <Button size="lg" loading={playerReadyMt.isPending} onClick={updateReadyState} className="w-full gap-2 px-8 text-base font-bold tracking-wider uppercase">
                                    {playerReadyMt.isPending ? null : <Play className="fill-primary-foreground size-4" />}
                                    <span>{ready ? "CANCEL READY" : "READY"}</span>
                                </Button>

                                <div className="flex h-2 w-full gap-1.5">
                                    {Array.from({ length: playerCount }).map((_, index) => (
                                        <div key={`progress-${index}`} className="border-line border-border bg-muted relative h-full flex-1 overflow-hidden">
                                            <div className="bg-primary h-full transition-[width] duration-500 ease-out" style={{ width: index < readyCount ? "100%" : "0%" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {room.players.map((p) => (
                                <PlayerCard key={p.playerId} player={p} host={p.playerId === room.hostId} me={p.playerId === player?.playerId} />
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        {isHost && (
                            <Button
                                size="lg"
                                loading={startGameMt.isPending}
                                disabled={!canStart || room.status === "starting"}
                                onClick={() => startGameMt.mutate({ roomId })}
                                className="w-full gap-2 px-8 text-base font-bold tracking-wider uppercase"
                            >
                                <Play className="fill-primary-foreground size-4" />
                                START GAME
                            </Button>
                        )}

                        {room.status === "starting" && (
                            <Countdown variant="warning" label="GAME STARTS IN" value={`00:${room.countdown.toString().padStart(2, "0")}`} className="border-line border-border bg-card shadow-nb flex-1 justify-between p-4" />
                        )}

                        <div className="border-line border-border bg-card hud-box shadow-nb relative p-5">
                            <div className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">ROOM RULES</div>

                            <ul className="space-y-2.5">
                                {rules.map(({ label, value, valueLabel, min, step, onChange }) => (
                                    <li key={label} className="border-line border-border/60 bg-background/40 flex items-center justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground text-sm font-bold tracking-widest uppercase">{label}</span>

                                        <div className="flex items-center gap-3">
                                            {isHost && <NumberInput disabled={!isHost || updateRoomSettingsMt.isPending} min={min} step={step} value={value} onChange={onChange} />}

                                            <span className="text-primary-ink text-base font-black tracking-wider uppercase">
                                                {value}
                                                <span className="text-muted-foreground ml-1 text-xs">{valueLabel}</span>
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {isHost && (
                                <Button size="lg" loading={updateRoomSettingsMt.isPending} disabled={!hasChanges} onClick={handleSave} className="mt-4 w-full gap-2 px-8 text-base font-bold tracking-wider uppercase">
                                    <Save className="size-4" />
                                    UPDATE SETTINGS
                                </Button>
                            )}
                        </div>
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
