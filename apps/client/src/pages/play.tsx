import ErrorState from "@/components/error-state";
import GameShell from "@/components/game-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIndicator } from "@/components/ui/signal-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectionSignal } from "@/contexts/connection-signal-context";
import { useToast } from "@/contexts/toast-context";
import { useCreateRoom, useJoinRoom } from "@/hooks/tan-stack/room";
import { useGetOrCreateSession, useOnlineCount, useUpdatePlayerName } from "@/hooks/tan-stack/session";
import { getStoredPlayerName } from "@/utils/player-name";
import { cn } from "cn";
import { KeyRound, Plus, User2, UserCheck2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function PlayPage() {
    const toast = useToast();
    const router = useNavigate();
    const { connection } = useConnectionSignal();
    const { data: onlineData, isPending: isOnlinePending } = useOnlineCount();
    const online = onlineData?.online;

    const { data: player, isPending: isSessionPending, error: sessionError, refetch: refetchSession, isFetching: sessionFetching } = useGetOrCreateSession();

    const [roomId, setRoomId] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [playerName, setPlayerName] = useState(() => getStoredPlayerName() ?? player?.name ?? "");

    const updateNameMt = useUpdatePlayerName({
        onSuccess: (updated) => {
            setPlayerName(updated.name);
            toast.addToast({ variant: "success", title: "Name updated" });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        },
        onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to update name" }),
    });
    const joinRoomMt = useJoinRoom({ onSuccess: ({ roomId }) => router("/room/" + roomId), onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to join room" }) });
    const createRoomMt = useCreateRoom({ onSuccess: ({ roomId }) => router("/room/" + roomId), onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to create room" }) });

    function saveName(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const name = playerName.trim();

        if (!name) return;

        updateNameMt.mutate({ name });
    }

    function joinRoom(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const normalized = roomId.trim().toUpperCase();

        if (!normalized) return;

        joinRoomMt.mutate({ roomId: normalized });
    }

    if (sessionError) {
        return <ErrorState code={sessionError.code ?? "ERROR"} codeLabel={sessionError.code} title="Couldn't start your session" tone="danger" message={sessionError.message} onRetry={() => refetchSession()} retrying={sessionFetching} />;
    }

    return (
        <GameShell>
            <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
                <div className="border-line border-border/40 bg-card text-muted-foreground shadow-nb-sm mx-auto w-fit px-3 py-1 font-mono text-[10px] font-bold tracking-[0.3em] uppercase">Create or join a lobby</div>
                <h1 className="font-display text-4xl font-black tracking-tight uppercase sm:text-6xl">
                    GET INTO THE <span className="text-primary-ink text-glow">ROOM</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg">Spin up a private lobby for your friends, or drop in with a room code someone sent you.</p>
            </div>

            <div className="border-line border-border bg-card shadow-nb mb-8 p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase">
                            <User2 className="text-primary-ink size-4" />
                            <span>PLAYER IDENTITY</span>
                        </div>
                        <h2 className="font-display text-2xl font-black tracking-tight uppercase sm:text-3xl">DISPLAY NAME</h2>
                        <p className="text-muted-foreground">This name will be visible to all players in the room.</p>
                    </div>

                    <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {isSessionPending ? (
                            <Skeleton className="h-14 w-full sm:w-72" />
                        ) : (
                            <Input type="text" value={playerName} placeholder="ENTER NAME" onChange={(e) => setPlayerName(e.target.value)} className="h-14 w-full px-4 font-bold tracking-wider sm:w-72" />
                        )}

                        <Button size="lg" type="submit" loading={updateNameMt.isPending} disabled={isSessionPending || !playerName.trim()} className="min-w-48 gap-2 px-8 text-base font-bold tracking-wider uppercase">
                            {isSaved ? <UserCheck2 className="size-5" /> : <User2 className="size-5" />}
                            <span>{isSaved ? "SAVED" : "UPDATE"}</span>
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                <div className="border-line border-border bg-card group hover:border-primary/50 shadow-nb hover:shadow-nb-lg relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 lg:col-span-3 lg:p-8">
                    <div className="border-primary/40 bg-primary/10 text-primary-ink shadow-nb-xs mb-5 flex size-12 items-center justify-center border">
                        <Plus className="size-6" />
                    </div>

                    <h2 className="font-display mb-2 text-2xl font-black tracking-tight uppercase transition-colors sm:text-3xl">CREATE A GAME</h2>
                    <p className="text-muted-foreground mb-6">Start a private room and invite your friends instantly.</p>

                    <div className="text-muted-foreground my-auto space-y-2.5 py-4 font-mono text-[11px] font-bold tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <span className="text-primary-ink">✦</span> Instant WebSocket Synchronization
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary-ink">✦</span> Real-Time Drawing Canvas
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary-ink">✦</span> Secret Imposter Roles
                        </div>
                    </div>

                    <Button size="lg" loading={createRoomMt.isPending} onClick={() => createRoomMt.mutate()} className="mt-auto h-14 w-full gap-3 px-8 text-base font-bold tracking-wider uppercase sm:w-fit">
                        <Plus className="fill-primary-foreground size-5" />
                        <span>CREATE ROOM</span>
                    </Button>
                </div>

                <div className="border-line border-border bg-card group shadow-nb hover:shadow-nb-lg relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 lg:p-8">
                    <div className="border-warning/40 bg-warning/10 text-warning shadow-nb-xs mb-5 flex size-12 items-center justify-center border">
                        <KeyRound className="size-6" />
                    </div>

                    <h2 className="font-display mb-2 text-2xl font-black tracking-tight uppercase transition-colors sm:text-3xl">JOIN A GAME</h2>
                    <p className="text-muted-foreground mb-8">Got an invite? Enter the room code.</p>

                    <form onSubmit={joinRoom} className="mt-auto space-y-3">
                        <label htmlFor="room-code" className="text-muted-foreground text-sm font-bold tracking-widest uppercase">
                            ROOM CODE
                        </label>

                        <Input
                            type="text"
                            maxLength={5}
                            id="room-code"
                            value={roomId}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="* * * * *"
                            onChange={(e) => setRoomId(e.target.value)}
                            onDoubleClick={() =>
                                window.navigator.clipboard
                                    .readText()
                                    .catch((err) => console.error("Failed to paste to clipboard", err))
                                    .then((value) => value && setRoomId(value))
                            }
                            className="font-display h-14 px-4 text-center text-xl font-black tracking-[0.4em] uppercase placeholder:tracking-[0.4em]"
                        />

                        <Button size="lg" type="submit" loading={joinRoomMt.isPending} disabled={!roomId.trim()} className="w-full gap-2 text-base font-bold tracking-wider uppercase">
                            JOIN ROOM
                        </Button>

                        <p className="text-muted-foreground text-center font-mono text-[10px] font-semibold tracking-wider uppercase">Room codes are 5 characters and not case sensitive.</p>
                    </form>
                </div>
            </div>

            <div className="border-line border-border/60 bg-card/60 shadow-nb-sm s mt-6 flex items-center justify-between gap-4 px-4 py-3">
                <SignalIndicator strength={connection} showValue />

                <div className="flex items-center gap-2">
                    <span className={cn("size-2 animate-pulse rounded-full", online && online > 0 ? "bg-success" : "bg-warning")} />
                    <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">{isOnlinePending || online == null ? "--" : online.toLocaleString()} PLAYERS ONLINE</span>
                </div>
            </div>
        </GameShell>
    );
}
