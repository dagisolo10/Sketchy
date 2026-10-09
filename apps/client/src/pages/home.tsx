import NavLink from "@/components/link";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-context";
import { useToast } from "@/contexts/toast-context";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { api, requestApi } from "@/lib/axios";
import { cn } from "cn";
import { Clock, Eye, LogOut, Unlock, Vote, Zap } from "lucide-react";
import { useEffect } from "react";

const STEPS = [
    {
        step: "01",
        title: "GET THE WORD",
        description: "Everyone receives the secret word. Except one player. They have to play along without flinching.",
        icon: Unlock,
        tag: 'WORD: "APPLE"',
        tagColor: "text-emerald-400",
        badgeStyle: "text-primary border-cyan-500/30 bg-cyan-500/10",
        hoverTitle: "group-hover:text-primary",
    },
    {
        step: "02",
        title: "DRAW QUICKLY",
        description: "You have 30 seconds to draw. The Imposter has to study strokes and improvise on the fly.",
        icon: Clock,
        tag: "30S TIMER TICKING",
        tagColor: "text-amber-400",
        badgeStyle: "text-primary border-cyan-500/30 bg-cyan-500/10",
        hoverTitle: "group-hover:text-primary",
    },
    {
        step: "03",
        title: "INSPECT DRAWINGS",
        description: "All sketches are revealed on the board. Look closely—someone's drawing makes zero sense.",
        icon: Eye,
        tag: "EVIDENCE REVEALED",
        tagColor: "text-cyan-300",
        badgeStyle: "text-primary border-cyan-500/30 bg-cyan-500/10",
        hoverTitle: "group-hover:text-primary",
    },
    {
        step: "04",
        title: "VOTE & REVEAL",
        description: "Discuss, accuse, point out suspicious lines, and cast votes. Unmask the liar to claim victory!",
        icon: Vote,
        tag: "EJECT IMPOSTER",
        tagColor: "text-accent-red",
        badgeStyle: "text-accent-red border-red-500/30 bg-red-500/10",
        hoverTitle: "group-hover:text-accent-red",
    },
];

export default function HomePage() {
    const { data: player, error, isLoading, isSuccess } = useGetOrCreateSession();

    const toast = useToast();
    const { connected, socket } = useSocket();

    const TOAST_ID = "session-loading-toast";

    useEffect(() => {
        if (isLoading) {
            toast.addToast({
                id: TOAST_ID,
                duration: Infinity,
                variant: "loading",
                title: "Connecting",
                description: "Creating your session...",
            });
        }

        if (error) {
            toast.removeToast(TOAST_ID);
            toast.addToast({
                variant: "error",
                title: "Session Error",
                description: error.message,
            });
        }

        if (isSuccess) {
            toast.removeToast(TOAST_ID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, error, isSuccess]);

    async function logout() {
        try {
            await requestApi(() => api.delete<void>("/session"));

            socket?.disconnect();
        } catch (error) {
            console.error("Error while logging out", error);
        }
    }

    return (
        <div className="relative min-h-screen">
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-40" />
            <div className="bg-accent-red/20 pointer-events-none fixed right-0 bottom-0 size-150 rounded-full blur-[180px]" />
            <div className="bg-primary/20 pointer-events-none fixed top-0 left-1/2 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <nav className="sticky top-0 z-40 flex items-center justify-between bg-transparent p-4 backdrop-blur-xl transition-all lg:px-24">
                <a href="#" className="group flex items-center gap-2">
                    <span className="text-glow group-hover:text-primary text-2xl font-black tracking-wider transition-colors">
                        SKETCHY<span className="text-accent-red">.</span>
                    </span>
                </a>
                <div className="space-x-4">
                    <span>Name: {player?.name}</span> <span>Connected: {connected ? "✅" : "❌"}</span>
                    <Button onClick={logout} className="gap-4 font-bold" variant={"outline"}>
                        Logout <LogOut />
                    </Button>
                </div>
            </nav>

            <div className="px-4 lg:px-16">
                <section className="relative overflow-hidden pt-12 pb-20">
                    <div className="mx-auto max-w-4xl space-y-6 text-center">
                        <h1 className="text-5xl leading-[1.1] font-black tracking-tight uppercase sm:text-6xl lg:text-7xl">
                            ONE WORD. <span className="text-primary">ONE LIAR.</span> <br />
                            WHO'S <span className="text-primary">SKETCHY</span>?
                        </h1>
                        <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-slate-300 sm:text-xl">
                            Everyone gets a secret word. One player doesn't. Draw your best guess, watch everyone else's sketches, and figure out who's faking it.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                            <NavLink icon={Zap} title="PLAY NOW — IT'S FREE" to="/play" />
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="relative border-t border-slate-800/80 py-20">
                    <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                        <div className="text-primary text-xl font-bold tracking-widest uppercase">SIMPLE 4-STEP GAMEPLAY</div>
                        <h2 className="text-3xl font-black tracking-tight uppercase sm:text-5xl">HOW A ROUND WORKS</h2>
                        <p className="text-xl text-slate-400">No complex rules or long tutorials. Get in, draw your stroke, point fingers, and catch the liar.</p>
                    </div>

                    <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="pointer-events-none absolute top-1/2 right-10 left-10 z-0 hidden h-0.5 -translate-y-1/2 bg-linear-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 lg:block" />

                        {STEPS.map(({ step, title, description, icon: Icon, tag, tagColor, badgeStyle, hoverTitle }) => (
                            <div key={step} className="hud-box group bg-card relative z-10 flex flex-col border border-slate-800 p-6 transition-all duration-500 hover:border-cyan-500/50">
                                <div className={cn("mb-5 flex size-12 items-center justify-center border text-xl font-bold transition-transform duration-300 group-hover:scale-110", badgeStyle)}>
                                    {step}
                                </div>
                                <h3 className={cn("mb-2 text-xl font-bold transition-transform duration-300 group-hover:scale-102", hoverTitle)}>{title}</h3>
                                <p className="mb-4 leading-relaxed text-slate-400">{description}</p>

                                <div className={cn("mt-auto flex items-center gap-2 border-t border-slate-800 pt-4 text-sm", tagColor)}>
                                    <Icon className="size-3.5" />
                                    <span>{tag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <footer className="relative border-t border-slate-800/80 px-4 py-8 text-xs lg:px-16">
                <div className="via-primary/50 absolute -top-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent" />

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start">
                        <span className="text-primary px-2 py-0.5 text-xl font-black tracking-widest uppercase">SKETCHY</span>{" "}
                        <span className="font-semibold tracking-wider uppercase">• MULTIPLAYER SOCIAL DEDUCTION DRAWING GAME</span>
                    </div>

                    <div className="font-mono text-sm tracking-wider uppercase">
                        <span className="text-primary">© 2026 SKETCHY</span> GAME STUDIO • ALL RIGHTS RESERVED
                    </div>
                </div>
            </footer>
        </div>
    );
}
