import GameOver from "@/components/game-over";
import IntroPage from "@/components/intro";
import ThemeSwitch from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import VotingIntro from "@/components/voting-intro";
import VotingResult from "@/components/voting-result";
import VotingView from "@/components/voting-view";
import type { EliminatedPlayer, GamePlayer, GameWinner, Role } from "@package/types";
import { cn } from "cn";
import { ArrowLeft, Check, ChevronRight, ChevronUp, Play, RotateCcw, SlidersHorizontal, TimerReset } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";

const NOOP = () => {};

const SECTIONS = [
    { id: "game-over", label: "Game Over", cinematic: false, description: "End-of-game screen — winner banner, revealed word, actions." },
    { id: "voting-intro", label: "Voting Intro", cinematic: true, description: "Cinematic lead-in before the vote. Replays the full timeline." },
    { id: "voting-result", label: "Voting Result", cinematic: true, description: "Cinematic reveal of the eliminated player or a tie." },
    { id: "voting-view", label: "Voting View", cinematic: false, description: "Vote ballot — targets, timer, time-up and submitted states." },
    { id: "intro", label: "Intro Page", cinematic: true, description: "Role reveal intro — civilian word reveal and imposter briefing." },
] as const;

const GAME_OVER_VARIANTS: { id: string; label: string; winner: GameWinner; secretWord: string; roomId: string }[] = [
    { id: "civilians", label: "Civilians win + word", winner: "civilians", secretWord: "MANGROVE", roomId: "ROOM42" },
    { id: "imposters", label: "Imposters win + word", winner: "imposters", secretWord: "MANGROVE", roomId: "ROOM42" },
    { id: "imposters-no-word", label: "Imposters win, no word", winner: "imposters", secretWord: "", roomId: "ROOM42" },
];

const VOTING_RESULT_VARIANTS: { id: string; label: string; result: EliminatedPlayer | null }[] = [
    { id: "imposter", label: "Imposter caught", result: { playerId: "p-mara", name: "Mara", role: "imposter" } },
    { id: "civilian", label: "Civilian voted out", result: { playerId: "p-jonas", name: "Jonas", role: "civilian" } },
    { id: "tie", label: "Tie / no one", result: null },
];

const VOTE_PLAYERS: GamePlayer[] = [
    { playerId: "p-mara", name: "Mara", ready: true, color: "#f97316", eliminated: false, ping: 24 },
    { playerId: "p-jonas", name: "Jonas", ready: true, color: "#22c55e", eliminated: false, ping: 120 },
    { playerId: "p-zeke", name: "Zeke", ready: true, color: "#a78bfa", eliminated: false, ping: 340 },
    { playerId: "p-lux", name: "Lux", ready: true, color: "#f43f5e", eliminated: false, ping: null },
    { playerId: "p-theo", name: "Theo", ready: true, color: "#38bdf8", eliminated: false, ping: 18 },
    { playerId: "p-iris", name: "Iris", ready: true, color: "#facc15", eliminated: false, ping: 84 },
];

type VotingSeed = { phase: "voting" | "submitted"; selectedVote: string | null; remaining: number | null };

const VOTING_VIEW_VARIANTS: { id: string; label: string; seed: VotingSeed }[] = [
    { id: "open", label: "Voting open", seed: { phase: "voting", selectedVote: null, remaining: 45 } },
    { id: "picked", label: "Target picked", seed: { phase: "voting", selectedVote: "p-theo", remaining: 21 } },
    { id: "skip", label: "Skip selected", seed: { phase: "voting", selectedVote: "skip", remaining: 9 } },
    { id: "expired", label: "Time up", seed: { phase: "voting", selectedVote: null, remaining: 0 } },
    { id: "submitted", label: "Submitted (timer)", seed: { phase: "submitted", selectedVote: "p-theo", remaining: 6 } },
    { id: "submitted-no-timer", label: "Submitted (no timer)", seed: { phase: "submitted", selectedVote: "p-theo", remaining: null } },
];

const INTRO_VARIANTS: { id: string; label: string; role: Role; secretWord: string | null; fellowImposters: string[] }[] = [
    { id: "civilian", label: "Civilian (has word)", role: "civilian", secretWord: "MANGROVE", fellowImposters: [] },
    { id: "imposter-solo", label: "Imposter (solo)", role: "imposter", secretWord: null, fellowImposters: [] },
    { id: "imposter-1", label: "Imposter + 1 fellow", role: "imposter", secretWord: null, fellowImposters: ["Mara"] },
    { id: "imposter-2", label: "Imposter + 2 fellows", role: "imposter", secretWord: null, fellowImposters: ["Mara", "Jonas"] },
];

function VotingViewStage({ seed }: { seed: VotingSeed }) {
    const [selectedVote, setSelectedVote] = useState<string | null>(seed.selectedVote);
    const [submitted, setSubmitted] = useState(seed.phase === "submitted");
    const [expired, setExpired] = useState(seed.remaining === 0);

    const reset = () => {
        setSelectedVote(seed.selectedVote);
        setSubmitted(seed.phase === "submitted");
        setExpired(seed.remaining === 0);
    };

    return (
        <>
            <VotingView
                players={VOTE_PLAYERS}
                currentPlayerId="p-mara"
                round={2}
                remaining={expired ? 0 : seed.remaining}
                phase={submitted ? "submitted" : "voting"}
                selectedVote={selectedVote}
                onSelect={setSelectedVote}
                onSubmit={() => setSubmitted(true)}
            />

            <div className="border-border bg-card/95 shadow-nb fixed bottom-3 left-1/2 z-95 flex -translate-x-1/2 items-center gap-2 rounded-md border px-3 py-2 backdrop-blur-sm">
                <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">Preview</span>
                <span className="bg-border h-4 w-px" />

                <Chip variant="success" selected={submitted} size="md" onClick={() => setSubmitted((s) => !s)} title="Toggle the locked-in / vote recorded state">
                    <Check className="size-3" />
                    Locked in
                </Chip>

                <Chip variant="danger" selected={expired} size="md" onClick={() => setExpired((e) => !e)} title="Toggle the time-expired state">
                    <TimerReset className="size-3" />
                    Time up
                </Chip>

                <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5 font-mono text-[10px]">
                    <RotateCcw className="size-3" />
                    Reset
                </Button>
            </div>
        </>
    );
}

function SectionStage({ section }: { section: (typeof SECTIONS)[number] }) {
    const [variantIndex, setVariantIndex] = useState(0);
    const [replay, setReplay] = useState(0);
    const [controlsOpen, setControlsOpen] = useState(true);
    const stageKey = `${section.id}-${variantIndex}-${replay}`;

    let stage: ReactNode = null;

    switch (section.id) {
        case "game-over": {
            const v = GAME_OVER_VARIANTS[variantIndex];
            stage = <GameOver winner={v.winner} secretWord={v.secretWord} roomId={v.roomId} />;
            break;
        }
        case "voting-intro":
            stage = <VotingIntro onComplete={NOOP} />;
            break;
        case "voting-result": {
            const v = VOTING_RESULT_VARIANTS[variantIndex];
            stage = <VotingResult result={v.result} onComplete={NOOP} />;
            break;
        }
        case "voting-view": {
            const v = VOTING_VIEW_VARIANTS[variantIndex];
            stage = <VotingViewStage seed={v.seed} />;
            break;
        }
        case "intro": {
            const v = INTRO_VARIANTS[variantIndex];
            stage = <IntroPage role={v.role} secretWord={v.secretWord} fellowImposters={v.fellowImposters} onComplete={NOOP} />;
            break;
        }
    }

    const variants =
        section.id === "game-over"
            ? GAME_OVER_VARIANTS
            : section.id === "voting-result"
              ? VOTING_RESULT_VARIANTS
              : section.id === "voting-view"
                ? VOTING_VIEW_VARIANTS
                : section.id === "intro"
                  ? INTRO_VARIANTS
                  : [{ id: "play", label: "Play timeline", seed: null }];

    return (
        <div className="select-none">
            <div key={stageKey} className="fixed inset-0 z-90">
                {stage}
            </div>

            <header className={cn("border-border bg-card/95 shadow-nb fixed inset-x-0 top-0 z-100 border-b backdrop-blur-sm transition-transform duration-300 ease-out", controlsOpen ? "translate-y-0" : "-translate-y-full")}>
                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 pr-14">
                    <Link to="/ui" className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                        <ArrowLeft className="size-3.5" />
                        Studio
                    </Link>

                    <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                        {SECTIONS.map((s) => {
                            const active = s.id === section.id;
                            return (
                                <Link
                                    key={s.id}
                                    to={`/ui/${s.id}`}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "border-radius-0 shrink-0 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors",
                                        active ? "bg-primary text-primary-foreground shadow-nb-xs" : "text-foreground/60 hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    {s.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <ThemeSwitch />
                </div>

                <div className="border-border flex flex-wrap items-center gap-2 border-t px-4 py-2 pr-14">
                    <span className="font-display shrink-0 text-xs font-black tracking-[0.2em] uppercase">{section.label}</span>
                    <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">{section.description}</span>

                    <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
                        {variants.map((v, i) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setVariantIndex(i)}
                                aria-pressed={i === variantIndex}
                                className={cn(
                                    "shrink-0 rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase transition-all",
                                    i === variantIndex ? "border-primary/60 bg-primary/10 text-primary-ink shadow-nb-xs" : "border-line border-border bg-background/60 text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {v.label}
                            </button>
                        ))}

                        {section.cinematic ? (
                            <Button size="sm" variant="secondary" onClick={() => setReplay((r) => r + 1)} className="shrink-0 gap-1.5 font-mono text-[10px]">
                                <RotateCcw className="size-3" />
                                Replay
                            </Button>
                        ) : null}
                    </div>
                </div>
            </header>

            <button
                type="button"
                onClick={() => setControlsOpen((open) => !open)}
                aria-expanded={controlsOpen}
                aria-label={controlsOpen ? "Hide controls" : "Show controls"}
                title={controlsOpen ? "Hide controls" : "Show controls"}
                className="border-line border-border bg-card/90 text-foreground/50 hover:text-foreground focus-visible:ring-ring/50 shadow-nb-xs fixed top-2 right-2 z-110 inline-flex size-8 items-center justify-center rounded-md border opacity-50 backdrop-blur-sm transition-all hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
            >
                {controlsOpen ? <ChevronUp className="size-4" /> : <SlidersHorizontal className="size-4" />}
            </button>
        </div>
    );
}

export default function UiShowcase() {
    const { section } = useParams<{ section: string }>();
    const active = SECTIONS.find((s) => s.id === section);

    if (!active) {
        return (
            <div className="bg-background relative flex min-h-screen flex-col">
                <div className="border-border bg-card/95 shadow-nb sticky top-0 z-100 flex items-center justify-between gap-3 border-b px-4 py-3">
                    <Link to="/" className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                        <ArrowLeft className="size-3.5" />
                        Back to app
                    </Link>
                    <span className="font-display text-primary-ink text-glow text-sm font-black tracking-[0.3em] uppercase">UI Studio</span>
                    <ThemeSwitch />
                </div>

                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-8">
                    <div className="mb-10 flex flex-col gap-2 text-center">
                        <h1 className="font-display m-0 text-4xl font-black tracking-[0.2em] uppercase sm:text-5xl">UI Studio</h1>
                        <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed">Preview every full-screen screen and its variants while editing their UI. Testing pages only — remove them before shipping.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {SECTIONS.map((s) => (
                            <Link key={s.id} to={`/ui/${s.id}`} className="border-line group border-border bg-card shadow-nb hover:shadow-nb-lg flex flex-col gap-3 p-5 transition-all">
                                <span className="font-display text-primary-ink text-xl font-black tracking-[0.2em] uppercase">{s.label}</span>
                                <span className="text-muted-foreground text-xs leading-relaxed">{s.description}</span>
                                <span className="text-foreground/60 group-hover:text-foreground mt-2 inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase">
                                    Open variants
                                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center gap-2 text-xs">
                        <Play className="text-warning size-3.5" />
                        <span className="text-muted-foreground tracking-widest uppercase">Cinematic screens replay automatically after their timeline ends — use the Replay button to restart.</span>
                    </div>
                </main>
            </div>
        );
    }

    return <SectionStage section={active} />;
}
