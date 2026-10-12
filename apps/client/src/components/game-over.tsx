import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { useLeaveRoom } from "@/hooks/tan-stack/room";
import type { GameWinner } from "@package/types";
import { cn } from "cn";
import { Crown, Home, Swords } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function GameOver({ winner, secretWord, roomId }: { winner: GameWinner; secretWord: string; roomId: string }) {
    const navigate = useNavigate();
    const toast = useToast();
    const civiliansWin = winner === "civilians";

    const leaveRoomMt = useLeaveRoom({
        onSuccess: () => {
            toast.addToast({ variant: "success", title: "Left the room" });
            navigate("/");
        },
        onError: (err) => toast.addToast({ variant: "error", description: err.message, title: "Failed to leave room" }),
    });

    return (
        <div className="bg-background/95 fixed inset-0 z-90 flex flex-col overflow-y-auto">
            <div className={cn("pointer-events-none fixed right-0 bottom-0 z-0 size-150 rounded-full blur-[180px]", civiliansWin ? "bg-success/5" : "bg-danger/5")} />
            <div className="bg-primary/10 pointer-events-none fixed top-0 left-1/2 z-0 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-8">
                <div className={cn("mb-8 flex size-24 items-center justify-center border-2", civiliansWin ? "border-success/50 bg-success/10 glow-green" : "border-danger/50 bg-danger/10 glow-red")}>
                    {civiliansWin ? <Crown className="text-success size-12" /> : <Swords className="text-danger size-12" />}
                </div>

                <h1 className={cn("font-display m-0 text-5xl leading-none font-black tracking-[0.2em] uppercase sm:text-7xl", civiliansWin ? "text-success text-glow-green" : "text-danger text-glow-red")}>
                    {civiliansWin ? "Civilians win" : "Imposters win"}
                </h1>

                <p className="text-muted-foreground mt-6 max-w-xl text-sm leading-relaxed">
                    {civiliansWin ? "The imposters have been uncovered. Every stroke, every guess, every doubt worked in your favor." : "The imposters escaped the vote and hid the secret word to the very end."}
                </p>

                {secretWord ? (
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-foreground/70 text-xs font-bold tracking-widest uppercase">The word was</span>
                        <span className="text-primary-ink text-glow font-display text-4xl font-black tracking-[0.3em] uppercase sm:text-4xl">{secretWord}</span>
                    </div>
                ) : null}

                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <Link to={`/room/${roomId}`}>
                        <Button variant="outline" size="lg" className="gap-3 px-8 text-sm font-bold tracking-widest uppercase">
                            <Swords className="size-4" />
                            View room
                        </Button>
                    </Link>
                    <Button size="lg" loading={leaveRoomMt.isPending} onClick={() => leaveRoomMt.mutate({ roomId })} className="gap-3 px-8 text-sm font-bold tracking-widest uppercase">
                        <Home className="size-4" />
                        Back home
                    </Button>
                </div>
            </div>
        </div>
    );
}
