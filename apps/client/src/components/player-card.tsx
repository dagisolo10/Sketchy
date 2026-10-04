import { cn } from "cn";
import { Crown } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import type { Player } from "@package/types";
import { getInitials } from "@/utils/helpers";
import { SignalIndicator } from "@/components/ui/signal-indicator";

interface PlayerCardProps {
    player: Player;
    host: boolean;
}

export default function PlayerCard({ player, host }: PlayerCardProps) {
    const ready = false;
    const connection = 99;
    const initials = getInitials(player.name);

    return (
        <article
            className={cn(
                "hud-box bg-card group relative flex flex-col items-center gap-3 border p-4 text-center transition-all duration-500 sm:p-5",
                ready ? "hover:border-accent-green/50 border-slate-800" : "hover:border-accent-amber/40 border-slate-800/70",
            )}
        >
            <div className="relative">
                <div
                    className={cn(
                        "relative flex size-14 items-center justify-center border text-xl font-black transition-all duration-500 sm:size-16",
                        host && "border-primary/60 bg-primary/10 text-primary glow-primary",
                        !host && ready && "border-accent-green/50 bg-accent-green/10 text-accent-green",
                        !host && !ready && "bg-background/60 border-slate-700 text-slate-500",
                    )}
                >
                    {initials}

                    {host ? <Crown className="text-primary absolute -top-4 -left-4 size-5.5 -rotate-45" /> : null}
                </div>

                <span
                    className={cn(
                        "border-card absolute -right-1 -bottom-1 size-3 rounded-full border-2",
                        connection >= 85 ? "bg-accent-green" : connection >= 70 ? "bg-accent-amber" : "bg-accent-red",
                    )}
                />
            </div>

            <div className="flex flex-col items-center gap-2">
                <p className={cn("text-base font-bold tracking-wide uppercase transition-colors sm:text-lg", host ? "text-primary" : ready ? "text-white" : "text-slate-400")}>{player.name}</p>
            </div>

            <div className="mt-auto flex w-full items-center justify-between gap-2 border-t border-slate-800 pt-4">
                <SignalIndicator strength={connection} bars={4} className="border-none p-0" />

                <Chip variant={ready ? "success" : "warning"} selected size="md" className="rounded-none">
                    {ready ? "READY" : "WAITING"}
                </Chip>
            </div>
        </article>
    );
}
