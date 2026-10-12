import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { ALLOW_SELF_VOTE } from "@/hooks/custom/use-voting";
import { getInitials } from "@/utils/helpers";
import type { GamePlayer } from "@package/types";
import { cn } from "cn";
import { Check, Loader2, Send, Skull, UserX } from "lucide-react";

interface VotingPlayerListProps {
    players: GamePlayer[];
    currentPlayerId: string | undefined;
    selectedVote: string | null;
    disabled: boolean;
    onSelect: (target: string | null) => void;
}

function VotingPlayerList({ players, currentPlayerId, selectedVote, disabled, onSelect }: VotingPlayerListProps) {
    const votable = players.filter((p) => ALLOW_SELF_VOTE || p.playerId !== currentPlayerId);

    const renderTarget = (target: string | null, key: string, label: string, initials: string | null, isSkip: boolean, color?: string) => {
        const selected = selectedVote === target;

        return (
            <button
                key={key}
                type="button"
                onClick={() => onSelect(target)}
                disabled={disabled}
                className={cn(
                    "border-line group shadow-nb relative flex flex-col items-center gap-3 overflow-hidden border p-4 text-center transition-all duration-300 select-none",
                    isSkip ? "bg-card hover:border-warning/60 hover:bg-warning/5" : "bg-card hover:border-danger/60 hover:bg-danger/5",
                    selected && (isSkip ? "border-warning bg-warning/10 shadow-warning/20 ring-warning/50 ring-2" : "border-danger bg-danger/10 shadow-danger/20 ring-danger/50 ring-2"),
                    disabled && "pointer-events-none opacity-50",
                )}
            >
                <div className="flex w-full items-center justify-between">
                    <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">{isSkip ? "#PASS" : "#SUSPECT"}</span>
                    {selected && (
                        <span className={cn("inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 font-mono text-[9px] font-black tracking-wider uppercase", isSkip ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger animate-pulse")}>
                            <Check className="size-3" />
                            LOCKED
                        </span>
                    )}
                </div>

                <div className="relative my-1">
                    <div
                        className={cn(
                            "relative flex size-16 items-center justify-center border font-mono text-xl font-black transition-all duration-300 sm:size-20",
                            isSkip ? "border-warning/50 bg-warning/10 text-warning" : "border-border bg-background/80 text-foreground",
                            selected && !isSkip && "border-danger text-danger bg-danger/20",
                        )}
                        style={{
                            borderColor: !isSkip && color ? color : undefined,
                        }}
                    >
                        {initials ?? <Skull className="size-7" />}
                    </div>

                    {color && !isSkip && <span className="border-card shadow-nb-xs absolute -right-1 -bottom-1 size-3.5 rounded-full border-2" style={{ backgroundColor: color }} />}
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <p className="font-display max-w-35 truncate text-base font-black tracking-wider uppercase">{label}</p>
                </div>

                <div className="border-border/40 mt-auto flex w-full items-center justify-center border-t pt-2">
                    <span className={cn("font-mono text-[10px] font-bold tracking-widest uppercase", isSkip ? "text-warning" : selected ? "text-danger" : "text-muted-foreground")}>
                        {isSkip ? "SKIP VOTE" : selected ? "TARGET ACQUIRED" : "SELECT SUSPECT"}
                    </span>
                </div>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {votable.map((p) => renderTarget(p.playerId, p.playerId, p.name, getInitials(p.name), false, p.color))}
            {renderTarget("skip", "skip", "Skip Vote", null, true)}
        </div>
    );
}

interface VotingViewProps {
    players: GamePlayer[];
    currentPlayerId: string | undefined;
    round: number;
    remaining: number | null;
    phase: "voting" | "submitted";
    selectedVote: string | null;
    onSelect: (target: string | null) => void;
    onSubmit: () => void;
}

export default function VotingView({ players, currentPlayerId, round, remaining, phase, selectedVote, onSelect, onSubmit }: VotingViewProps) {
    const timerValue = remaining === null ? "--" : `00:${remaining.toString().padStart(2, "0")}`;
    const expired = remaining === 0;
    const canSubmit = phase === "voting" && selectedVote !== null && !expired;

    const selectedPlayer = players.find((p) => p.playerId === selectedVote);

    return (
        <div className="bg-background/95 fixed inset-0 z-90 flex flex-col overflow-y-auto backdrop-blur-md">
            <div className="bg-danger/10 pointer-events-none fixed right-0 bottom-0 z-0 size-150 animate-pulse rounded-full blur-[180px]" />
            <div className="bg-warning/10 pointer-events-none fixed top-0 left-1/2 z-0 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-8">
                <header className="border-border mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="border-line border-danger/40 bg-danger/10 text-danger shadow-nb-xs inline-block px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">ROUND {round}</span>
                        </div>
                        <h1 className="font-display text-primary-ink text-glow text-3xl font-black tracking-widest uppercase sm:text-5xl">VOTE OUT THE IMPOSTER</h1>
                    </div>

                    <Countdown label="TIME REMAINING" value={timerValue} variant={expired ? "danger" : "warning"} className="border-line border-border bg-card shadow-nb px-5 py-3 font-mono" />
                </header>

                <section className="border-line border-border hud-box bg-card shadow-nb flex flex-col gap-6 p-5 sm:p-8">
                    {phase === "submitted" ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                            <div className="border-success/60 bg-success/10 text-success glow-green flex size-24 animate-pulse items-center justify-center rounded-lg border-2">
                                <Check className="size-12 stroke-3" />
                            </div>
                            <div className="flex max-w-md flex-col gap-2">
                                <h2 className="font-display text-2xl font-black tracking-widest uppercase">Vote Recorded</h2>
                                <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">Your judgment has been logged. Standing by for remaining crew decisions...</p>
                            </div>
                            {remaining !== null ? <Countdown label="CLOSING IN" value={timerValue} variant="danger" /> : null}
                            <div className="border-border/80 bg-background/50 shadow-nb-xs text-muted-foreground inline-flex items-center gap-3 border px-4 py-2 font-mono text-xs font-bold tracking-widest uppercase">
                                <Loader2 className="text-primary size-4 animate-spin" />
                                Waiting for other players...
                            </div>
                        </div>
                    ) : (
                        <>
                            {expired ? (
                                <div className="border-danger/40 bg-danger/10 shadow-nb-xs flex flex-col gap-1 border px-4 py-3">
                                    <span className="text-danger flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                                        <UserX className="size-4" />
                                        Time Expired — Default Action Taken
                                    </span>
                                    <span className="text-muted-foreground font-mono text-xs">
                                        You failed to cast a ballot before the countdown hit zero. Your vote was automatically assigned to <span className="text-warning font-bold tracking-widest uppercase">Skip</span>.
                                    </span>
                                </div>
                            ) : (
                                <span className="text-foreground flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                                    <span className="bg-danger size-2 animate-ping rounded-full" />
                                    Select Target for Elimination:
                                </span>
                            )}

                            <VotingPlayerList players={players} currentPlayerId={currentPlayerId} selectedVote={selectedVote} disabled={expired} onSelect={onSelect} />

                            <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                                <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
                                    {selectedVote ? (
                                        <div className="bg-background border-border shadow-nb-xs flex items-center gap-2 border px-3 py-1.5">
                                            <span className="bg-success size-2 animate-pulse rounded-full" />
                                            <span>
                                                Target: <strong className="text-foreground font-black tracking-widest">{selectedVote === "skip" ? "SKIP" : (selectedPlayer?.name ?? selectedVote)}</strong>
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-warning font-mono">⚠️ No target selected. Choose a suspect to proceed.</span>
                                    )}
                                </div>

                                <Button size="lg" disabled={!canSubmit} onClick={onSubmit} className="shadow-nb gap-3 px-8 font-mono text-xs font-black tracking-[0.2em] uppercase hover:translate-x-0.5 hover:translate-y-0.5">
                                    <Send className="size-4" />
                                    Confirm Verdict
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
