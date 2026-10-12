import { cn } from "cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="skeleton" aria-hidden className={cn("bg-foreground/10 animate-pulse", className)} {...props} />;
}
