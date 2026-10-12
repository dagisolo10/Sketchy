import GameShell from "@/components/game-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomSkeleton() {
    return (
        <GameShell trailing={<Skeleton className="h-10 w-36" />}>
            <section className="pt-10 pb-16" aria-busy="true" aria-label="Loading room">
                <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-12 w-72 sm:h-16 sm:w-96" />
                    </div>

                    <Skeleton className="h-16 w-full max-w-xs" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Skeleton className="h-40 w-full" />

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={`player-skeleton-${index}`} className="h-48 w-full" />
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-72 w-full" />
                    </aside>
                </div>
            </section>
        </GameShell>
    );
}
