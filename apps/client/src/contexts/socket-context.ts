import type { ClientToServerEvents, ServerToClientEvents } from "@package/types";
import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketContextType = {
    connected: boolean;
    socket: TypedSocket | null;
};

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});

export function useSocket() {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error("Wrap the app with SocketProvider");
    }

    return context;
}
