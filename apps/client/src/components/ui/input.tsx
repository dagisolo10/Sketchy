import { cn } from "cn";
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "border-line border-border bg-background file:text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 flex h-10 w-full rounded-[min(var(--radius-md),8px)] px-3 py-2 text-base shadow-nb-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:shadow-nb-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = "Input";

export { Input };