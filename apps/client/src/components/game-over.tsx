import { Button } from "@/components/ui/button";
import { useLeaveRoom } from "@/hooks/tan-stack/room";
import type { GameWinner } from "@package/types";
import { cn } from "cn";
import { Crown, Home, Swords } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function GameOver({ winner, secretWord, roomId }: { winner: GameWinner; secretWord: string; roomId: string }) {
    const navigate = useNavigate();
    const civiliansWin = winner === "civilians";

    const leaveRoomMt = useLeaveRoom({ onSuccess: () => navigate("/") });

    return (
        <div className="bg-background/95 fixed inset-0 z-90 flex flex-col overflow-y-auto">
            <div className="scanlines pointer-events-none fixed inset-0 z-91 opacity-40" />
            <div className={cn("pointer-events-none fixed right-0 bottom-0 z-0 size-150 rounded-full blur-[180px]", civiliansWin ? "bg-accent-green/5" : "bg-accent-red/5")} />
            <div className="bg-primary/10 pointer-events-none fixed top-0 left-1/2 z-0 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-8">
                <div className={cn("mb-8 flex size-24 items-center justify-center rounded-full border-2", civiliansWin ? "border-accent-green/50 bg-accent-green/10 glow-green" : "border-accent-red/50 bg-accent-red/10 glow-red")}>
                    {civiliansWin ? <Crown className="text-accent-green size-12" /> : <Swords className="text-accent-red size-12" />}
                </div>

                <h1
                    className={cn(
                        "m-0 text-5xl leading-none font-black tracking-[0.2em] uppercase sm:text-7xl",
                        civiliansWin ? "text-accent-green text-shadow-[0_0_40px_var(--accent-green-glow)]" : "text-accent-red text-shadow-[0_0_40px_var(--accent-red-glow)]",
                    )}
                >
                    {civiliansWin ? "Civilians win" : "Imposters win"}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-500">
                    {civiliansWin
                        ? "The imposters have been uncovered. Every stroke, every guess, every doubt worked in your favor."
                        : "The imposters escaped the vote and hid the secret word to the very end."}
                </p>

                {secretWord ? (
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-foreground/70 text-xs font-bold tracking-widest uppercase">The word was</span>
                        <span className="text-primary text-glow text-3xl font-black tracking-[0.3em] uppercase sm:text-4xl">{secretWord}</span>
                    </div>
                ) : null}

                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <Link to={`/room/${roomId}`}>
                        <Button variant="outline" size="lg" className="gap-3 rounded-none px-8 text-sm font-bold tracking-widest uppercase">
                            <Swords className="size-4" />
                            View room
                        </Button>
                    </Link>
                    <Button size="lg" disabled={leaveRoomMt.isPending} onClick={() => leaveRoomMt.mutate({ roomId })} className="glow-primary gap-3 rounded-none px-8 text-sm font-bold tracking-widest uppercase">
                        <Home className="size-4" />
                        {leaveRoomMt.isPending ? "Leaving..." : "Back home"}
                    </Button>
                </div>
            </div>
        </div>
    );
}