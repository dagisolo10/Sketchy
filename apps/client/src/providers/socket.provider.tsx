import { SocketContext, type TypedSocket } from "@/contexts/socket-context";
import { SERVER_URL } from "@/lib/axios";
import type { ClientData, ClientEvents, Player } from "@package/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { io, type ExtendedError } from "socket.io-client";

export default function SocketProvider({ children }: PropsWithChildren) {
    const queryClient = useQueryClient();
    const player = queryClient.getQueryData<Player>(["session"]);

    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<TypedSocket | null>(null);

    function onConnect() {
        setConnected(true);
    }

    function onDisconnect() {
        setConnected(false);
    }

    function onConnectError(error: ExtendedError) {
        console.error("Error connecting to socket:", error);
    }

    useEffect(() => {
        if (!player) return;

        const socketInstance = io(SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            withCredentials: true,
            transports: ["websocket"],
        });

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);
        socketInstance.on("connect_error", onConnectError);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        return () => {
            socketInstance.off("connect", onConnect);
            socketInstance.off("disconnect", onDisconnect);
            socketInstance.off("connect_error", onConnectError);
        };
    }, [player]);

    const emit = useCallback(
        <Event extends ClientEvents>(event: Event, ...args: ClientData<Event>) => {
            if (socket && socket.connected) socket.emit(event, ...args);
        },
        [socket],
    );

    return <SocketContext.Provider value={{ connected, socket, emit }}>{children}</SocketContext.Provider>;
}
