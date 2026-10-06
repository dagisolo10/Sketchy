import { createContext, useContext } from "react";

export type ToastVariant = "info" | "success" | "warning" | "error" | "loading";

export interface ToastItem {
    id: string;
    title: string;
    duration?: number;
    description?: string;
    variant?: ToastVariant;
}

export type AddToastInput = Omit<ToastItem, "id"> & { id?: string };

interface ToastContextValue {
    toasts: ToastItem[];
    removeToast: (id: string) => void;
    addToast: (toast: AddToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);

    if (!ctx) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return ctx;
}
