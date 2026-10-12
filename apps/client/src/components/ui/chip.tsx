import { cn } from "cn";

interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
    onRemove?: () => void;
    selected?: boolean;
    size?: "sm" | "md";
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Chip({ selected = false, onRemove, variant = "default", size = "sm", disabled = false, className, children, ...props }: ChipProps) {
    const variants: Record<string, { base: string; active: string }> = {
        danger: {
            active: "border-danger/50 bg-danger/10 text-danger",
            base: "border-danger/20 text-muted-foreground hover:border-danger/40 hover:text-danger",
        },
        default: {
            active: "border-border bg-muted text-foreground",
            base: "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
        },
        success: {
            active: "border-success/50 bg-success/10 text-success",
            base: "border-success/20 text-muted-foreground hover:border-success/40 hover:text-success",
        },
        warning: {
            active: "border-warning/50 bg-warning/10 text-warning",
            base: "border-warning/20 text-muted-foreground hover:border-warning/40 hover:text-warning",
        },
        info: {
            active: "border-info/50 bg-info/10 text-info",
            base: "border-info/20 text-muted-foreground hover:border-info/40 hover:text-info",
        },
    };

    const v = variants[variant] ?? variants["default"];

    return (
        <button
            type="button"
            disabled={disabled}
            data-slot="tron-chip"
            className={cn(
                "border-line inline-flex shrink-0 items-center gap-1.5 font-mono rounded-[min(var(--radius-sm),6px)] tracking-widest uppercase transition-all select-none",
                size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]",
                disabled && "cursor-not-allowed opacity-40",
                selected ? v.active : v.base,
                className,
            )}
            {...props}
        >
            {children}
            {onRemove ? (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                            onRemove();
                        }
                    }}
                    className="hover:bg-foreground/10 ml-0.5 flex h-3 w-3 items-center justify-center rounded-full"
                >
                    <svg aria-hidden="true" width="5" height="5" viewBox="0 0 5 5" fill="none">
                        <path d="M0.5 0.5l4 4M4.5 0.5l-4 4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    </svg>
                </span>
            ) : null}
        </button>
    );
}