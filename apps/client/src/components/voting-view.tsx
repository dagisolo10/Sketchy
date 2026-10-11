import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { ALLOW_SELF_VOTE } from "@/hooks/custom/use-voting";
import { getInitials } from "@/utils/helpers";
import type { GamePlayer } from "@package/types";
import { cn } from "cn";
import { Check, Loader2, Minus, Send } from "lucide-react";

interface VotingPlayerListProps {
    players: GamePlayer[];
    currentPlayerId: string | undefined;
    selectedVote: string | null;
    disabled: boolean;
    onSelect: (target: string | null) => void;
}

function VotingPlayerList({ players, currentPlayerId, selectedVote, disabled, onSelect }: VotingPlayerListProps) {
    const votable = players.filter((p) => ALLOW_SELF_VOTE || p.playerId !== currentPlayerId);

    const renderTarget = (target: string | null, key: string, label: string, initials: string | null, isSkip: boolean) => {
        const selected = selectedVote === target;

        return (
            <button
                key={key}
                type="button"
                onClick={() => onSelect(target)}
                disabled={disabled}
                className={cn(
                    "hud-box group focus-visible:border-primary/60 focus-visible:ring-primary/50 flex flex-col items-center gap-3 border p-4 text-center transition-all duration-300 select-none focus-visible:ring-1",
                    isSkip ? "hover:border-accent-amber/40 border-slate-800/70" : "hover:border-primary/40 border-slate-800",
                    selected && "border-primary/70 bg-primary/10 glow-primary",
                    disabled && "pointer-events-none opacity-50",
                )}
            >
                <div
                    className={cn(
                        "relative flex size-14 items-center justify-center border text-xl font-black transition-all duration-300 sm:size-16",
                        isSkip ? "border-accent-amber/50 bg-accent-amber/10 text-accent-amber" : "bg-background/60 border-slate-700 text-slate-400",
                        selected && "border-primary/60 bg-primary/10 text-primary",
                    )}
                >
                    {initials ?? <Minus className="size-6" />}
                    {selected ? <Check className="text-primary bg-background absolute -top-3 -right-3 size-5 border border-slate-800 p-1" /> : null}
                </div>
                <p className="text-base font-bold tracking-wide uppercase">{label}</p>
                <span className={cn("text-[10px] font-bold tracking-widest uppercase transition-colors", isSkip ? "text-accent-amber/80" : "text-slate-500", selected && "text-primary")}>{isSkip ? "NO VOTE" : "TARGET"}</span>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {votable.map((p) => renderTarget(p.playerId, p.playerId, p.name, getInitials(p.name), false))}
            {renderTarget("skip", "skip", "Skipping vote", null, true)}
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

    return (
        <div className="bg-background/95 fixed inset-0 z-90 flex flex-col overflow-y-auto">
            <div className="scanlines pointer-events-none fixed inset-0 z-91 opacity-40" />
            <div className="bg-accent-red/5 pointer-events-none fixed right-0 bottom-0 z-0 size-150 rounded-full blur-[180px]" />
            <div className="bg-primary/10 pointer-events-none fixed top-0 left-1/2 z-0 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-8">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-foreground/80 text-xs font-bold tracking-widest uppercase">Round {round}</span>
                        <h1 className="text-primary text-glow text-4xl font-black tracking-[0.2em] uppercase sm:text-5xl">
                            Vote out the<span className="text-accent-red glow-red"> imposter</span>
                        </h1>
                    </div>

                    <Countdown label="TIME LEFT" value={timerValue} variant={expired ? "danger" : "warning"} className="bg-card border border-slate-800 px-4 py-3" />
                </header>

                <section className="hud-box bg-card flex flex-col gap-6 border border-slate-800 p-6 sm:p-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-accent-amber text-xs font-black tracking-[0.3em] uppercase">Invite check</span>
                        <p className="max-w-2xl text-xs leading-relaxed text-slate-500">Drawing is over. Choose who you suspect of being the imposter, then confirm your vote. You can also skip voting if you are unsure.</p>
                    </div>

                    {phase === "submitted" ? (
                        <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
                            <div className="border-primary/40 bg-primary/10 text-primary glow-primary flex size-20 items-center justify-center rounded-full border-2">
                                <Check className="size-9" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold tracking-widest uppercase">Vote submitted</h2>
                                <p className="text-sm text-slate-400">Waiting for the other players to finish voting...</p>
                            </div>
                            {remaining !== null ? <Countdown label="TIME LEFT" value={timerValue} variant="danger" /> : null}
                            <span className="mt-2 inline-flex items-center gap-2 text-xs tracking-widest text-slate-500 uppercase">
                                <Loader2 className="size-4 animate-spin" />
                                Locked
                            </span>
                        </div>
                    ) : (
                        <>
                            {expired ? (
                                <div className="border-accent-amber/40 bg-accent-amber/10 flex flex-col gap-1 border px-4 py-3">
                                    <span className="text-accent-amber text-sm font-bold tracking-widest uppercase">Time is up</span>
                                    <span className="text-xs text-slate-400">
                                        You did not vote in time. Your vote was cast as <span className="text-accent-amber font-bold tracking-widest uppercase">Skip</span>.
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground/80 text-xs font-bold tracking-widest uppercase">Who do you suspect?</span>
                                </div>
                            )}

                            <VotingPlayerList players={players} currentPlayerId={currentPlayerId} selectedVote={selectedVote} disabled={expired} onSelect={onSelect} />

                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-800 pt-5">
                                <div className="flex items-center gap-2 text-xs tracking-widest text-slate-500 uppercase">
                                    {selectedVote ? (
                                        <>
                                            <Check className="text-accent-green size-4" />
                                            <span>
                                                Voting for: <span className="text-foreground font-bold">{selectedVote === "skip" ? "SKIP" : (players.find((p) => p.playerId === selectedVote)?.name ?? selectedVote)}</span>
                                            </span>
                                        </>
                                    ) : (
                                        <span>Select a target to confirm your vote</span>
                                    )}
                                </div>
                                <Button size="lg" disabled={!canSubmit} onClick={onSubmit} className="glow-primary gap-3 rounded-none px-8 text-sm font-bold tracking-widest uppercase">
                                    <Send className="size-4" />
                                    Confirm vote
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
