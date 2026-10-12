import ThemeSwitch from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

export interface ErrorStateProps {
    title: string;
    message: string;
    code?: string;
    codeLabel?: string;
    tone?: "danger" | "warning" | "info";
    onRetry?: () => void;
    retrying?: boolean;
    homeLabel?: string;
}

const TONE_TEXT: Record<NonNullable<ErrorStateProps["tone"]>, string> = {
    danger: "text-danger glow-red-lg-text",
    warning: "text-warning text-glow-amber-lg",
    info: "text-info",
};

export default function ErrorState({ title, message, code = "ERROR", codeLabel, tone = "danger", onRetry, retrying = false, homeLabel = "RETURN HOME" }: ErrorStateProps) {
    return (
        <main className="relative flex min-h-screen flex-col justify-between px-6 py-10 lg:px-16">
            <div className="flex items-center justify-between gap-4">
                <Link to="/" className="group flex items-center gap-2">
                    <span className="text-glow group-hover:text-primary-ink font-display text-2xl font-black tracking-wider uppercase transition-colors">
                        SKETCHY<span className="text-accent-red">.</span>
                    </span>
                </Link>

                <ThemeSwitch />
            </div>

            <div className="my-auto max-w-4xl space-y-6 py-12">
                <div className={cn("font-display text-6xl font-black tracking-tighter uppercase sm:text-9xl", TONE_TEXT[tone])}>{code}</div>

                <div className="flex flex-wrap items-center gap-3">
                    <TriangleAlert className="text-muted-foreground size-5 shrink-0" />
                    <h1 className="font-display text-3xl font-black uppercase sm:text-5xl">{title}</h1>
                </div>

                <p className="text-muted-foreground max-w-xl text-base sm:text-lg">{message}</p>

                {codeLabel ? <span className="border-line border-border bg-card text-muted-foreground shadow-nb-sm inline-flex w-fit px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase">{codeLabel}</span> : null}

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <Link to="/">
                        <Button className="h-14 w-full gap-3 px-8 text-base font-bold tracking-wider uppercase sm:w-auto">
                            <ArrowLeft className="size-5" />
                            <span>{homeLabel}</span>
                        </Button>
                    </Link>

                    {onRetry ? (
                        <Button variant="outline" loading={retrying} onClick={onRetry} className="h-14 w-full gap-3 px-8 text-base font-bold tracking-wider uppercase sm:w-auto">
                            {retrying ? null : <RefreshCw className="size-5" />}
                            <span>TRY AGAIN</span>
                        </Button>
                    ) : null}
                </div>
            </div>
        </main>
    );
}
