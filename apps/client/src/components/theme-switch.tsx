import { useTheme, type Theme } from "@/contexts/theme-context";
import { cn } from "cn";
import { Monitor, Moon, Sun } from "lucide-react";

const OPTIONS: { id: Theme; label: string; icon: typeof Moon }[] = [
    { id: "neo", label: "Neo", icon: Sun },
    { id: "system", label: "System", icon: Monitor },
    { id: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="border-border bg-card inline-flex items-center gap-1 rounded-lg border">
            {OPTIONS.map(({ id, label, icon: Icon }) => {
                const active = theme === id;

                return (
                    <button
                        key={id}
                        type="button"
                        title={label}
                        aria-pressed={active}
                        onClick={() => setTheme(id)}
                        data-active={active ? "true" : undefined}
                        className={cn(
                            "text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground relative inline-flex items-center justify-center rounded-md border border-transparent p-2 text-sm font-medium transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                            "data-[active=true]:bg-background data-[active=true]:text-foreground dark:data-[active=true]:border-input dark:data-[active=true]:bg-input/30 dark:data-[active=true]:text-foreground data-[active=true]:shadow-sm",
                            "after:bg-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:opacity-0 after:transition-opacity data-[active=true]:after:opacity-100",
                        )}
                    >
                        <Icon className="size-3.5" />
                        <span className="sr-only">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
