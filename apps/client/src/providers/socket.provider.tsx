import { SocketContext, type TypedSocket } from "@/contexts/socket-context";
import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { SERVER_URL } from "@/lib/axios";
import type { ServerToClientEvents } from "@package/types";
import { useEffect, useState, type PropsWithChildren } from "react";
import { io, type ExtendedError } from "socket.io-client";

export default function SocketProvider({ children }: PropsWithChildren) {
    const { data: player } = useGetOrCreateSession();

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

    function onConnectionError(error: Parameters<ServerToClientEvents["connection_error"]>[0]) {
        console.error("Error connecting to socket:", error);
    }

    useEffect(() => {
        if (!player) return;

        const socketInstance = io(SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            withCredentials: true,
            transports: ["websocket"],
        }) as TypedSocket;

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);
        socketInstance.on("connect_error", onConnectError);
        socketInstance.on("connection_error", onConnectionError);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        return () => {
            socketInstance.off("connect", onConnect);
            socketInstance.off("disconnect", onDisconnect);
            socketInstance.off("connect_error", onConnectError);
            socketInstance.off("connection_error", onConnectionError);
        };
    }, [player]);

    return <SocketContext.Provider value={{ connected, socket }}>{children}</SocketContext.Provider>;
}
