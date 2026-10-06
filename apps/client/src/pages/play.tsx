import GameShell from "@/components/game-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { SignalIndicator } from "@/components/ui/signal-indicator";
import { useToast } from "@/contexts/toast-context";
import { useCreateRoom, useJoinRoom } from "@/hooks/tan-stack/room";
import { useGetOrCreateSession, useUpdatePlayerName } from "@/hooks/tan-stack/session";
import { KeyRound, Plus, User2, UserCheck2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function PlayPage() {
    const toast = useToast();
    const router = useNavigate();
    const { data: player } = useGetOrCreateSession();

    const [roomId, setRoomId] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [playerLimit, setPlayerLimit] = useState(6);
    const [drawingTime, setDrawingTime] = useState(30);
    const [imposterCount, setImposterCount] = useState(1);
    const [playerName, setPlayerName] = useState(player?.name ?? "User");

    const updateNameMt = useUpdatePlayerName();
    const joinRoomMt = useJoinRoom({
        onSuccess: ({ roomId }) => router("/room/" + roomId),
        onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to join room" }),
    });
    const createRoomMt = useCreateRoom({
        onSuccess: ({ roomId }) => router("/room/" + roomId),
        onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to create room" }),
    });

    const roomSettings = [
        { label: "PLAYER LIMIT", value: playerLimit, valueLabel: "PLAYERS", min: 1, step: 1, onChange: setPlayerLimit },
        { label: "IMPOSTER COUNT", value: imposterCount, valueLabel: "IMPOSTER", min: 1, step: 1, onChange: setImposterCount },
        { label: "DRAWING TIME", value: drawingTime, valueLabel: "SECONDS", min: 10, step: 5, onChange: setDrawingTime },
    ];

    function saveName(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const name = playerName.trim();

        if (!name) return;

        updateNameMt.mutate({ name });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    }

    function joinRoom(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const normalized = roomId.trim().toUpperCase();

        if (!normalized) return;

        joinRoomMt.mutate({ roomId: normalized });
    }

    return (
        <GameShell>
            <section className="pt-12 pb-16">
                <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
                    <h1 className="text-4xl font-black tracking-tight uppercase sm:text-6xl">
                        GET INTO THE <span className="text-glow text-primary">ROOM</span>
                    </h1>
                    <p className="text-xl text-slate-400">Spin up a private lobby for your friends, or drop in with a room code someone sent you.</p>
                </div>

                <div className="bg-card mb-8 border border-slate-800 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
                                <User2 className="text-primary size-4" />
                                <span>PLAYER IDENTITY</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight uppercase sm:text-3xl">DISPLAY NAME</h2>
                            <p className="text-slate-400">This name will be visible to all players in the room.</p>
                        </div>

                        <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Input
                                type="text"
                                value={playerName}
                                placeholder="ENTER NAME"
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="bg-background/60 focus-visible:border-primary h-14 w-full rounded-none border-slate-800 px-4 text-3xl font-bold tracking-wider placeholder:text-slate-700 focus-visible:ring-0 sm:w-72"
                            />

                            <Button size="lg" type="submit" className="glow-primary bg-primary text-background h-14 min-w-48 gap-2 rounded-none px-8 text-base font-bold tracking-wider uppercase">
                                {isSaved ? <UserCheck2 className="size-5" /> : <User2 className="size-5" />}
                                <span>{isSaved ? "SAVED" : "UPDATE"}</span>
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <div className="hud-box bg-card group hover:border-primary/50 relative flex flex-col border border-slate-800 p-6 transition-all duration-500 lg:col-span-3 lg:p-8">
                        <div className="text-primary border-primary/40 bg-primary/10 mb-5 flex size-12 items-center justify-center border">
                            <Plus className="size-6" />
                        </div>

                        <h2 className="mb-2 text-2xl font-black tracking-tight uppercase transition-colors sm:text-3xl">CREATE A GAME</h2>
                        <p className="mb-8 text-lg text-slate-400">Start a room and invite your friends.</p>

                        <div className="mb-8 space-y-3">
                            <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">DEFAULT SETTINGS</div>

                            {roomSettings.map(({ label, valueLabel, value, min, onChange, step }) => (
                                <div key={label} className="bg-background/40 flex items-center justify-between border border-slate-800 px-4 py-3">
                                    <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">{label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold tracking-wider text-white uppercase">
                                            {value} {valueLabel}
                                        </span>
                                        <NumberInput min={min} onChange={onChange} value={value} step={step} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={createRoomMt.isPending}
                            onClick={() => createRoomMt.mutate({ maxPlayers: playerLimit, drawingTime, imposterCount })}
                            className="glow-primary bg-primary group text-background hover:text-foreground hover:border-primary flex h-14 w-fit cursor-pointer items-center gap-3 border border-transparent px-8 text-base font-bold tracking-wider uppercase transition-[scale,color,background-color,border-color] duration-[300ms,500ms,500ms,500ms] hover:bg-transparent active:scale-98"
                        >
                            <Plus className="fill-background group-hover:fill-foreground size-5 transition-colors duration-500" />
                            <span>{createRoomMt.isPending ? "CREATING" : "CREATE"} ROOM</span>
                        </button>
                    </div>

                    <div className="hud-box bg-card group hover:border-accent-amber/50 relative flex flex-col border border-slate-800 p-6 transition-all duration-500 lg:col-span-2 lg:p-8">
                        <div className="text-accent-amber border-accent-amber/40 bg-accent-amber/10 mb-5 flex size-12 items-center justify-center border">
                            <KeyRound className="size-6" />
                        </div>

                        <h2 className="mb-2 text-2xl font-black tracking-tight uppercase transition-colors sm:text-3xl">JOIN A GAME</h2>
                        <p className="mb-8 text-lg text-slate-400">Got an invite? Enter the room code.</p>

                        <form onSubmit={joinRoom} className="mt-auto space-y-3">
                            <label htmlFor="room-code" className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                                ROOM CODE
                            </label>

                            <Input
                                type="text"
                                maxLength={5}
                                id="room-code"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="* * * * *"
                                onChange={(e) => setRoomId(e.target.value)}
                                className="bg-background/60 focus-visible:border-primary h-14 rounded-none border-slate-800 px-4 text-center text-xl font-black tracking-[0.4em] text-white uppercase placeholder:tracking-[0.4em] placeholder:text-slate-700 focus-visible:ring-0"
                            />

                            <Button size="lg" type="submit" disabled={joinRoomMt.isPending} className="h-14 w-full gap-2 rounded-none text-base font-bold tracking-wider uppercase">
                                JOIN ROOM
                            </Button>

                            <p className="text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">Room codes are 5 characters and not case sensitive.</p>
                        </form>
                    </div>
                </div>

                <div className="bg-card/60 mt-6 flex flex-wrap items-center justify-center gap-4 border border-slate-800 px-4 py-3 sm:justify-between">
                    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">LOBBY NETWORK</span>

                    <SignalIndicator strength={92} label="SIGNAL" showValue className="border-slate-800" />

                    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">1,420 PLAYERS ONLINE</span>
                </div>
            </section>
        </GameShell>
    );
}
