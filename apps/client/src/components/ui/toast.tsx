import { ToastContext, type AddToastInput, type ToastItem, type ToastVariant } from "@/contexts/toast-context";
import { cn } from "cn";
import * as React from "react";

export type ToastPosition = "top-left" | "top-center" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";

export function ToastProvider({ children, position = "bottom-right" }: { children: React.ReactNode; position?: ToastPosition }) {
    const [toasts, setToasts] = React.useState<ToastItem[]>([]);

    const addToast = React.useCallback((toast: AddToastInput) => {
        const id = toast.id ?? Math.random().toString(36).slice(2, 9);

        setToasts((prev) => [...prev, { ...toast, id }]);

        const duration = toast.duration ?? 4000;

        if (Number.isFinite(duration) && duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
            {children}

            <ToastContainer toasts={toasts} onRemove={removeToast} position={position} />
        </ToastContext.Provider>
    );
}

const positionStyles: Record<ToastPosition, string> = {
    "top-left": "top-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "top-right": "top-4 right-4 items-end",

    "center-left": "top-1/2 left-4 -translate-y-1/2 items-start",
    "center-right": "top-1/2 right-4 -translate-y-1/2 items-end",

    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-4 right-4 items-end",
};

const variantStyles: Record<ToastVariant, string> = {
    loading: "border-foreground/15",
    info: "border-primary/30",
    error: "border-red-500/30",
    warning: "border-amber-500/30",
    success: "border-accent-green/30",
};

const variantDots: Record<ToastVariant, string> = {
    loading: "bg-foreground/40",
    error: "bg-red-400",
    info: "bg-primary",
    warning: "bg-amber-400",
    success: "bg-accent-green",
};

function ToastContainer({ toasts, onRemove, position }: { toasts: ToastItem[]; onRemove: (id: string) => void; position: ToastPosition }) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className={cn("fixed z-100 flex max-w-[calc(100vw-2rem)] flex-col gap-2", positionStyles[position])}>
            {toasts.map((toast) => {
                const variant = toast.variant || "info";
                const isLoading = variant === "loading";

                return (
                    <div
                        key={toast.id}
                        data-slot="tron-toast"
                        className={cn(
                            "bg-card/95 relative max-w-sm min-w-70 overflow-hidden rounded border px-4 py-3 shadow-[0_0_20px_rgba(var(--primary-rgb,0,180,255),0.06)] backdrop-blur-md",
                            variantStyles[variant],
                        )}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />
                        <div className="flex items-start gap-2.5">
                            {isLoading ? (
                                <span className="border-foreground/15 border-t-foreground/60 mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2" />
                            ) : (
                                <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", variantDots[variant])} />
                            )}
                            <div className="flex-1">
                                <span className="text-foreground/70 block font-mono text-sm tracking-widest uppercase"> {toast.title} </span>
                                {toast.description ? <span className="text-foreground/35 mt-0.5 block font-mono text-xs"> {toast.description} </span> : null}
                            </div>
                            <button type="button" onClick={() => onRemove(toast.id)} className="text-foreground/20 hover:text-foreground/50 shrink-0">
                                <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="border-primary/30 pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l" />
                        <div className="border-primary/30 pointer-events-none absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b" />
                    </div>
                );
            })}
        </div>
    );
}
