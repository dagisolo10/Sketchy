import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "group/button cursor-pointer duration-200 inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-bold tracking-wider whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: "border-line border-border bg-primary text-primary-foreground shadow-nb hover:shadow-nb-lg hover:brightness-105",
                outline: "border-line border-border bg-background text-foreground shadow-nb hover:bg-muted hover:shadow-nb-lg",
                secondary: "border-line border-border bg-secondary text-secondary-foreground shadow-nb hover:bg-accent hover:shadow-nb-lg",
                ghost: "text-foreground hover:bg-muted data-[active=true]:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground",
                destructive: "border-line border-danger/40 bg-danger/10 text-danger shadow-nb hover:bg-danger/20 hover:shadow-nb-lg focus-visible:border-danger/40 focus-visible:ring-danger/20",
                link: "text-primary-ink underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 gap-1.5 px-2.5 rounded-[min(var(--radius-md),10px)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs",
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-nb-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
                lg: "h-14 gap-1.5 px-2.5 rounded-[min(var(--radius-md),10px)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                icon: "size-9 rounded-[min(var(--radius-md),10px)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs",
                "icon-xs": "size-6 rounded-[min(var(--radius-md),8px)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-nb-xs in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
                "icon-sm": "size-8 rounded-[min(var(--radius-md),10px)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs in-data-[slot=button-group]:rounded-md",
                "icon-lg": "size-10 rounded-[min(var(--radius-md),10px)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-xs",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({ className, variant = "default", size = "default", loading = false, disabled, children, ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
    return (
        <ButtonPrimitive data-slot="button" disabled={disabled || loading} className={cn(buttonVariants({ variant, size, className }))} {...props}>
            {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {children}
        </ButtonPrimitive>
    );
}

export { Button };
