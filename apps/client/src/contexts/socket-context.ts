import type { ClientData, ClientEvents, TypedSocket } from "@/types/socket-events";
import { createContext, useContext } from "react";

type SocketContextType = {
    connected: boolean;
    socket: TypedSocket | null;
    emit: <Event extends ClientEvents>(event: Event, ...args: ClientData<Event>) => void;
};

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    emit: () => {},
    connected: false,
});

export function useSocket() {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error("Wrap the app with SocketProvider");
    }

    return context;
}
