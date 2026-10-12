import { Chip } from "@/components/ui/chip";
import { SignalIndicator } from "@/components/ui/signal-indicator";
import { useConnectionSignal } from "@/contexts/connection-signal-context";
import { getInitials } from "@/utils/helpers";
import type { Player } from "@package/types";
import { cn } from "cn";
import { Crown, User } from "lucide-react";

interface PlayerCardProps {
    me: boolean;
    host: boolean;
    player: Player;
    className?: string;
}

const STATUS_CHIP: Record<"idle" | "ready", { variant: "warning" | "success"; label: string }> = {
    idle: { variant: "warning", label: "WAITING" },
    ready: { variant: "success", label: "READY" },
};

function pingDotColor(ping: number | null) {
    if (ping === null) return "bg-muted-foreground/30";
    if (ping < 100) return "bg-success";
    if (ping < 300) return "bg-warning";
    return "bg-danger";
}

export default function PlayerCard({ player: { name, ready, ping: remotePing }, host, me, className }: PlayerCardProps) {
    const { connection } = useConnectionSignal();

    const signal = me ? connection : remotePing;
    const initials = getInitials(name);
    const resolvedStatus: "idle" | "ready" = ready ? "ready" : "idle";
    const chip = STATUS_CHIP[resolvedStatus];

    return (
        <article
            className={cn(
                "border-line border-border bg-card shadow-nb hover:shadow-nb-lg relative flex flex-col items-center gap-4 border p-5 text-center transition-all duration-300",
                ready ? "border-success/40 bg-success/5 shadow-success/5" : "border-border",
                className,
            )}
        >
            <div className="flex w-full items-center justify-between gap-2">
                {host ? (
                    <span className="border-warning/40 bg-warning/10 text-warning inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase">
                        <Crown className="size-3" />
                        Host
                    </span>
                ) : (
                    <span className="text-muted-foreground/40 font-mono text-[10px]">#PLAYER</span>
                )}

                {me && (
                    <span className="border-primary/40 bg-primary/10 text-primary-ink inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-black tracking-widest uppercase">
                        <User className="size-3" />
                        YOU
                    </span>
                )}
            </div>

            <div className="relative my-1">
                <div
                    className={cn(
                        "border-line relative flex size-16 items-center justify-center rounded-lg font-mono text-2xl font-black transition-all duration-300 sm:size-20",
                        ready ? "border-success bg-success/20 text-success shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "border-border bg-muted/50 text-muted-foreground",
                    )}
                >
                    {initials}
                </div>

                {signal !== null ? <span title={`Ping: ${signal}ms`} className={cn("border-card absolute -right-1 -bottom-1 size-3.5 rounded-full border-2 transition-colors", pingDotColor(signal))} /> : null}
            </div>

            <div className="flex flex-col items-center gap-1">
                <p className={cn("font-display max-w-35 truncate text-base font-black tracking-wider uppercase transition-colors sm:text-lg", ready ? "text-foreground" : "text-muted-foreground")}>{name}</p>
            </div>

            <div className="border-border/60 mt-auto flex w-full items-center justify-between gap-2 border-t pt-3.5">
                <SignalIndicator showStatus strength={signal} bars={4} showValue className="border-none p-0" />

                <Chip variant={chip.variant} selected size="md" className={cn("rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase transition-transform", ready && "animate-pulse")}>
                    {chip.label}
                </Chip>
            </div>
        </article>
    );
}
