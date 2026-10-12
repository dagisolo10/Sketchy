import ThemeSwitch from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/contexts/socket-context";
import { useToast } from "@/contexts/toast-context";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { cn } from "cn";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";

interface GameShellProps {
    className?: string;
    children: ReactNode;
    trailing?: ReactNode;
    contentClassName?: string;
}

export default function GameShell({ children, trailing, className, contentClassName }: GameShellProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toast = useToast();
    const { connected } = useSocket();

    const { data: player, error, isLoading, isPending, isSuccess } = useGetOrCreateSession();

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

    return (
        <div className={cn("relative min-h-screen", className)}>
            <div className="bg-accent-red/5 pointer-events-none fixed right-0 bottom-0 size-150 rounded-full blur-[180px]" />
            <div className="bg-primary/10 pointer-events-none fixed top-0 left-1/2 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <nav className="border-border/10 sticky top-0 z-40 border-b backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 p-4 lg:px-16">
                    <Link to="/" className="group flex items-center gap-2">
                        <span className="text-glow group-hover:text-primary-ink font-display text-2xl font-black tracking-wider uppercase transition-colors duration-300">
                            SKETCHY<span className="text-accent-red">.</span>
                        </span>
                    </Link>

                    <div className="hidden flex-wrap items-center justify-end gap-3 md:flex">
                        <ThemeSwitch />

                        {isPending ? (
                            <Skeleton className="h-7 w-32" />
                        ) : player ? (
                            <span className="border-line border-border bg-card shadow-nb-sm inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                                <span className="text-muted-foreground">NAME</span>
                                <span className="text-foreground">{player.name}</span>
                            </span>
                        ) : null}

                        <Chip variant={connected ? "success" : "danger"} selected size="md">
                            {connected ? "Online" : "Offline"}
                        </Chip>

                        {trailing}
                    </div>

                    <Button variant="outline" size="sm" className="flex size-9 items-center justify-center p-0 md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle Navigation Menu">
                        {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </Button>
                </div>

                <div
                    className={cn(
                        "border-border/10 bg-card/95 overflow-hidden border-b backdrop-blur-2xl transition-all duration-300 ease-in-out md:hidden",
                        mobileMenuOpen ? "max-h-96 px-4 py-4 opacity-100" : "max-h-0 border-b-0 px-4 py-0 opacity-0",
                    )}
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase">Theme</span>
                            <ThemeSwitch />
                        </div>

                        {isPending ? (
                            <Skeleton className="h-8 w-full" />
                        ) : player ? (
                            <div className="border-line border-border bg-card/50 shadow-nb-sm flex items-center justify-between px-3 py-2 font-mono text-xs font-bold tracking-widest uppercase">
                                <span className="text-muted-foreground">Name</span>
                                <span className="text-foreground">{player.name}</span>
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase">Status</span>
                            <Chip variant={connected ? "success" : "danger"} selected size="md">
                                {connected ? "Online" : "Offline"}
                            </Chip>
                        </div>

                        {trailing && <div className="border-border/10 flex flex-col gap-3 border-t pt-3">{trailing}</div>}
                    </div>
                </div>
            </nav>

            <main className={cn("relative z-10 px-4 py-12 lg:px-16", contentClassName)}>{children}</main>
        </div>
    );
}
