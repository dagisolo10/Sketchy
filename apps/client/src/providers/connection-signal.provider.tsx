import { ConnectionSignalContext } from "@/contexts/connection-signal-context";
import { useSocket } from "@/contexts/socket-context";
import { useEffect, useReducer, type PropsWithChildren } from "react";

const PING_INTERVAL_MS = 1_500;
const PING_TIMEOUT_MS = 2_000;

type PingAction = { type: "measured"; ping: number } | { type: "void" } | { type: "disconnect" };

function pingReducer(_ping: number | null, action: PingAction): number | null {
    switch (action.type) {
        case "measured":
            return action.ping;
        case "void":
        case "disconnect":
            return null;
    }
}

/**
 * Single shared connection-quality measurement source for the whole app.
 *
 * Runs exactly one heartbeat loop while the socket is connected, measuring the
 * real Socket.IO round-trip latency on each tick. Any component that wants the
 * current latency subscribes to the shared state via `useConnectionSignal()`,
 * so N consumers never produce N ping loops.
 */
export default function ConnectionSignalProvider({ children }: PropsWithChildren) {
    const { socket, connected: socketConnected } = useSocket();
    const [ping, dispatch] = useReducer(pingReducer, null);

    useEffect(() => {
        if (!socket || !socketConnected) {
            dispatch({ type: "disconnect" });
            return;
        }

        let cancelled = false;

        const measure = async () => {
            if (cancelled || !socket.connected) return;

            const start = Date.now();

            try {
                await socket.timeout(PING_TIMEOUT_MS).emitWithAck("connection:ping");
                const measured = Date.now() - start;

                if (!cancelled) {
                    dispatch({ type: "measured", ping: measured });
                    socket.emit("connection:update", { ping: measured });
                }
            } catch {
                if (!cancelled) dispatch({ type: "void" });
            }
        };

        measure();

        const interval = setInterval(measure, PING_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [socket, socketConnected]);

    return <ConnectionSignalContext.Provider value={{ ping, connection: ping, connected: socketConnected }}>{children}</ConnectionSignalContext.Provider>;
}
