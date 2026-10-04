import type { ReactNode } from "react";
import { Link } from "react-router";

interface GameShellProps {
    children: ReactNode;
    trailing?: ReactNode;
}

export default function GameShell({ children, trailing }: GameShellProps) {
    return (
        <div className="relative min-h-screen">
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-40" />
            <div className="bg-accent-red/5 pointer-events-none fixed right-0 bottom-0 size-150 rounded-full blur-[180px]" />
            <div className="bg-primary/10 pointer-events-none fixed top-0 left-1/2 h-100 w-250 -translate-x-1/2 rounded-full blur-[150px]" />

            <header className="relative z-10 p-4 lg:px-24">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="group flex items-center gap-2">
                        <span className="text-glow group-hover:text-primary text-2xl font-black tracking-wider transition-colors">
                            SKETCHY<span className="text-accent-red">.</span>
                        </span>
                    </Link>

                    {trailing}
                </div>
            </header>

            <main className="relative z-10 px-4 pb-24 lg:px-16">{children}</main>
        </div>
    );
}
