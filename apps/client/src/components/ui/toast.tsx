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
    loading: "border-border",
    info: "border-info/40",
    error: "border-danger/40",
    warning: "border-warning/40",
    success: "border-success/40",
};

const variantDots: Record<ToastVariant, string> = {
    loading: "bg-muted-foreground",
    error: "bg-danger",
    info: "bg-info",
    warning: "bg-warning",
    success: "bg-success",
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
                        className={cn("border-line border-border bg-card relative max-w-sm min-w-70 overflow-hidden rounded-[min(var(--radius-md),8px)] px-4 py-3 shadow-nb", variantStyles[variant])}
                    >
                        <div className="paper-texture pointer-events-none absolute inset-0 opacity-50" />
                        <div className="flex items-start gap-2.5">
                            {isLoading ? (
                                <span className="border-border border-t-foreground/60 mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2" />
                            ) : (
                                <span className={cn("mt-1.5 h-2 w-2 shrink-0", variantDots[variant])} />
                            )}
                            <div className="flex-1">
                                <span className="text-foreground block font-mono text-sm font-bold tracking-widest uppercase"> {toast.title} </span>
                                {toast.description ? <span className="text-muted-foreground mt-0.5 block font-mono text-xs"> {toast.description} </span> : null}
                            </div>
                            <button type="button" onClick={() => onRemove(toast.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                                <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="border-foreground/60 pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l" />
                        <div className="border-foreground/60 pointer-events-none absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b" />
                    </div>
                );
            })}
        </div>
    );
}