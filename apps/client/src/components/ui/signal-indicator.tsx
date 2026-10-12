import { cn } from "cn";
import * as React from "react";

interface SignalIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
    bars?: number;
    label?: string;
    showValue?: boolean;
    showStatus?: boolean;
    strength: number | null;
    status?: "connected" | "weak" | "disconnected";
}

const statusColor: Record<string, { bar: string; dot: string; text: string }> = {
    connected: {
        bar: "bg-success",
        dot: "bg-success",
        text: "text-success",
    },
    disconnected: {
        bar: "bg-danger",
        dot: "bg-danger animate-pulse",
        text: "text-danger",
    },
    weak: {
        bar: "bg-warning",
        dot: "bg-warning",
        text: "text-warning",
    },
};

/** Maps a measured latency into a 0..1 signal fraction for the bar meter. */
function pingStrength(ping: number): number {
    if (ping < 50) return 1;
    if (ping < 100) return 0.75;
    if (ping < 200) return 0.5;
    if (ping < 300) return 0.25;
    return 0;
}

function autoStatus(strength: number | null): "connected" | "weak" | "disconnected" {
    if (strength === null || !Number.isFinite(strength) || strength >= 300) {
        return "disconnected";
    }
    if (strength >= 100) {
        return "weak";
    }
    return "connected";
}

export function SignalIndicator({ strength, bars = 5, label, showValue = false, showStatus = false, status, className, ...props }: SignalIndicatorProps) {
    const resolvedStatus = status ?? autoStatus(strength);
    const colors = statusColor[resolvedStatus];
    const filledBars = strength === null ? 0 : Math.round(pingStrength(strength) * bars);
    const value = strength === null || !Number.isFinite(strength) ? "—" : Math.round(strength);

    const [visibleBars, setVisibleBars] = React.useState(0);
    React.useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            current++;
            setVisibleBars(current);
            if (current >= filledBars) {
                clearInterval(interval);
            }
        }, 80);
        return () => clearInterval(interval);
    }, [filledBars]);

    return (
        <div data-slot="tron-signal-indicator" className={cn("border-line border-border bg-card inline-flex items-center gap-3 overflow-hidden rounded-[min(var(--radius-sm),6px)] px-3 py-2", className)} {...props}>
            {label ? <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">{label}</span> : null}

            <div className="flex items-end gap-0.75" style={{ height: 20 }}>
                {Array.from({ length: bars }, (_, i) => {
                    const filled = i < visibleBars;
                    const barHeight = 6 + ((i + 1) / bars) * 14;
                    return <div key={i} className={cn("w-1.25 rounded-t-sm transition-all duration-200", filled ? colors.bar : "bg-muted")} style={{ height: barHeight }} />;
                })}
            </div>

            {showValue ? <span className={cn("font-mono text-xs font-bold tabular-nums", colors.text)}>{value}ms</span> : null}

            {showStatus ? <span className={cn("font-mono text-[9px] font-bold tracking-widest uppercase", colors.text)}>{resolvedStatus}</span> : null}
        </div>
    );
}
