import { THEME_STORAGE_KEY, ThemeContext, type Theme } from "@/contexts/theme-context";
import { useEffect, useState, type PropsWithChildren } from "react";

function getSystemTheme(): "neo" | "dark" {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "neo";
}

function resolveTheme(saved: string | null): Theme {
    if (saved === "neo" || saved === "dark" || saved === "system") {
        return saved;
    }
    return "system";
}

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") return "dark";

        return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    });

    useEffect(() => {
        const root = document.documentElement;

        root.classList.remove("dark", "neo");

        const activeTheme = theme === "system" ? getSystemTheme() : theme;
        root.classList.add(activeTheme);

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.error("Failed to persist theme", error);
        }

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                root.classList.remove("dark", "neo");
                root.classList.add(getSystemTheme());
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeContext.Provider>;
}
