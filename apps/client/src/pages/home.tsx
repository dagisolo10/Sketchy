import GameShell from "@/components/game-shell";
import NavLink from "@/components/link";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-context";
import { useToast } from "@/contexts/toast-context";
import { api, requestApi } from "@/lib/axios";
import { cn } from "cn";
import { Clock, Eye, LogOut, Unlock, Vote, Zap } from "lucide-react";
import { useState } from "react";

const STEPS = [
    {
        step: "01",
        title: "GET THE WORD",
        description: "Everyone receives the secret word. Except one player. They have to play along without flinching.",
        icon: Unlock,
        tag: 'WORD: "APPLE"',
        token: "success",
    },
    {
        step: "02",
        title: "DRAW QUICKLY",
        description: "You have 30 seconds to draw. The Imposter has to study strokes and improvise on the fly.",
        icon: Clock,
        tag: "30s timer ticking",
        token: "warning",
    },
    {
        step: "03",
        title: "INSPECT DRAWINGS",
        description: "All sketches are revealed on the board. Look closely—someone's drawing makes zero sense.",
        icon: Eye,
        tag: "evidence revealed",
        token: "info",
    },
    {
        step: "04",
        title: "VOTE & REVEAL",
        description: "Discuss, accuse, point out suspicious lines, and cast votes. Unmask the liar to claim victory!",
        icon: Vote,
        tag: "eject imposter",
        token: "danger",
    },
] as const;

const ACCENTS: Record<(typeof STEPS)[number]["token"], { text: string; badge: string; glow: string }> = {
    success: { text: "text-success", badge: "border-success/40 bg-success/10 text-success", glow: "shadow-nb-sm" },
    warning: { text: "text-warning", badge: "border-warning/40 bg-warning/10 text-warning", glow: "shadow-nb-sm" },
    info: { text: "text-info", badge: "border-info/40 bg-info/10 text-info", glow: "shadow-nb-sm" },
    danger: { text: "text-danger", badge: "border-danger/40 bg-danger/10 text-danger", glow: "shadow-nb-sm" },
};

export default function HomePage() {
    const toast = useToast();
    const { socket } = useSocket();
    const [loggingOut, setLoggingOut] = useState(false);

    async function logout() {
        setLoggingOut(true);

        try {
            await requestApi(() => api.delete<void>("/session"));

            socket?.disconnect();
            toast.addToast({ variant: "success", title: "Logged out", description: "See you next round." });
        } catch (error) {
            toast.addToast({ variant: "error", description: error instanceof Error ? error.message : undefined, title: "Failed to log out" });
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <>
            <GameShell
                contentClassName="pb-0"
                trailing={
                    <Button onClick={logout} loading={loggingOut} variant="outline" size="sm" className="w-full gap-2 px-3 text-xs uppercase md:w-auto">
                        <LogOut className="size-3.5" />
                        Logout
                    </Button>
                }
            >
                <div className="bg-danger/5 neo:opacity-0 pointer-events-none fixed right-0 bottom-0 size-150 rounded-full blur-[180px]" />
                <div className="bg-primary/10 neo:opacity-0 pointer-events-none fixed top-0 left-1/2 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

                <div className="relative z-10">
                    <section className="relative overflow-hidden pb-20">
                        <div className="mx-auto max-w-4xl space-y-6 text-center">
                            <div className="border-line border-warning/50 text-warning bg-warning/10 shadow-nb-sm mx-auto mb-4 w-fit px-3 py-1 font-mono text-xs font-bold tracking-[0.3em] uppercase">A social deduction drawing game</div>

                            <h1 className="font-display text-5xl leading-[1.05] font-black tracking-tight uppercase sm:text-6xl lg:text-7xl">
                                ONE WORD. <span className="text-primary-ink/80">ONE LIAR.</span> <br />
                                WHO'S <span className="text-accent-red">SKETCHY</span>?
                            </h1>

                            <p className="text-muted-foreground mx-auto max-w-2xl font-sans text-base leading-relaxed sm:text-xl">
                                Everyone gets a secret word. One player doesn't. Draw your best guess, watch everyone else's sketches, and figure out who's faking it.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                                <NavLink icon={Zap} title="PLAY NOW — IT'S FREE" to="/play" />
                            </div>
                        </div>
                    </section>

                    <section id="how-it-works" className="relative py-20">
                        <div className="bg-accent-amber/10 pointer-events-none absolute top-1/2 left-1/2 z-0 h-1/2 w-1/3 -translate-x-1/2 rounded-full blur-[120px]" />

                        <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center">
                            <div className="text-primary-ink font-mono font-black tracking-[0.4em] uppercase">Simple 4-step gameplay</div>
                            <h2 className="font-display text-3xl font-black tracking-tight uppercase sm:text-5xl">How a round works</h2>
                            <p className="text-muted-foreground font-sans text-lg">No complex rules or long tutorials. Get in, draw your stroke, point fingers, and catch the liar.</p>
                        </div>

                        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="from-info/20 via-info/40 to-info/20 pointer-events-none absolute top-1/2 right-10 left-10 z-0 hidden h-0.5 -translate-y-1/2 bg-linear-to-r lg:block" />

                            {STEPS.map(({ step, title, description, icon: Icon, tag, token }) => (
                                <div key={step} className="group border-line border-border bg-card shadow-nb hover:shadow-nb-lg relative z-10 flex flex-col p-6 transition-all duration-300 hover:-translate-y-1">
                                    <div
                                        className={cn(
                                            "border-line mb-5 flex size-12 items-center justify-center rounded-[min(var(--radius-sm),6px)] font-mono text-lg font-black transition-transform duration-300 group-hover:scale-105",
                                            ACCENTS[token].badge,
                                        )}
                                    >
                                        {step}
                                    </div>

                                    <div className="border-line border-border/60 absolute top-6 right-4 flex size-10 items-center justify-center rounded-[min(var(--radius-sm),6px)]">
                                        <Icon className={cn("size-5", ACCENTS[token].text)} />
                                    </div>

                                    <h3 className="font-display mb-2 text-lg font-black uppercase">{title}</h3>
                                    <p className="text-muted-foreground mb-4 font-sans text-sm leading-relaxed">{description}</p>

                                    <div className={cn("border-border mt-auto flex items-center gap-2 border-t pt-4 font-mono text-[10px] font-bold tracking-widest uppercase", ACCENTS[token].text)}>
                                        <Icon className="size-3" />
                                        <span>{tag}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </GameShell>

            <footer className="border-border relative z-10 border-t px-4 py-8 lg:px-16">
                <div className="via-primary/50 absolute -top-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent" />

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start">
                        <span className="text-primary-ink font-display px-2 py-0.5 text-xl font-black tracking-widest uppercase">SKETCHY</span>
                        <span className="text-muted-foreground text-center font-mono text-[10px] font-semibold tracking-wider uppercase sm:text-left sm:text-xs">Multiplayer social deduction drawing game</span>
                    </div>

                    <div className="text-muted-foreground font-mono text-sm font-bold tracking-wider uppercase">
                        <span className="text-primary-ink">© 2026 SKETCHY</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
