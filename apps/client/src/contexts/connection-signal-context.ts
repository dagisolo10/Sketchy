import { createContext, useContext } from "react";

export interface ConnectionSignal {
    /** Latest measured Socket.IO round-trip latency in ms, or null when unknown/disconnected. */
    ping: number | null;
    /** The measured latency in ms, ready to pass to SignalIndicator's `strength`. */
    connection: number | null;
    /** Whether the underlying socket connection is currently up. */
    connected: boolean;
}

export const ConnectionSignalContext = createContext<ConnectionSignal>({
    ping: null,
    connection: null,
    connected: false,
});

export function useConnectionSignal() {
    const context = useContext(ConnectionSignalContext);

    if (!context) {
        throw new Error("useConnectionSignal must be used within ConnectionSignalProvider");
    }

    return context;
}