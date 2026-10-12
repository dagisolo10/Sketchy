import { cn } from "cn";

interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
    bg?: boolean;
    label: string;
    value: string;
    textClassName?: string;
    variant?: "default" | "danger" | "warning" | "success";
}

export function Countdown({ value, label, variant = "default", className, bg = true, textClassName, ...props }: CountdownProps) {
    const variantStyles = {
        danger: {
            text: "text-foreground/70",
            bg: bg ? "bg-danger/10" : "",
            chip: "border-danger/50 text-danger",
        },
        default: {
            text: "text-foreground/70",
            bg: bg ? "bg-danger/10" : "",
            chip: "border-primary/50 text-primary-ink",
        },
        warning: {
            text: "text-foreground/70",
            bg: bg ? "bg-warning/10" : "",
            chip: "border-warning/50 text-warning",
        },
        success: {
            text: "text-foreground/70",
            bg: bg ? "bg-success/10" : "",
            chip: "border-success/50 text-success",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className={cn("flex items-center gap-1", className)} {...props}>
            <span className={cn("font-mono text-xs font-bold tracking-widest uppercase", styles.text)}>{label}:</span>
            <span
                data-variant={variant}
                data-slot="tron-countdown-value"
                className={cn("border-line shadow-nb-xs rounded-[min(var(--radius-sm),6px)] px-3 py-px font-mono text-sm font-black tracking-wider tabular-nums", styles.chip, styles.bg, textClassName)}
            >
                {value}
            </span>
        </div>
    );
}
