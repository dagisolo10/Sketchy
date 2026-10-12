import GameShell from "@/components/game-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function GameSkeleton() {
    return (
        <GameShell trailing={<Skeleton className="h-10 w-36" />}>
            <section aria-busy="true" aria-label="Loading game">
                <Skeleton className="mb-4 h-14 w-full" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="border-line border-border bg-card col-span-1 flex flex-col overflow-hidden shadow-nb lg:col-span-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-120 min-h-95 w-full lg:h-150" />
                    </div>

                    <aside className="col-span-1 space-y-4">
                        <Skeleton className="h-36 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
