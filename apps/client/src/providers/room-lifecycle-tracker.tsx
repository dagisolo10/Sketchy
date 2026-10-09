import { useSocket } from "@/contexts/socket-context";
import { useLeaveRoom } from "@/hooks/tan-stack/room";
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useParams } from "react-router";

export function RoomLifecycleTracker() {
    const location = useLocation();
    const leaveRoomMt = useLeaveRoom();

    const prevRoomId = useRef<string | null>(null);
    const { roomId } = useParams<{ roomId: string }>();

    useEffect(() => {
        const previousRoomId = prevRoomId.current;

        if (previousRoomId && previousRoomId !== roomId) {
            leaveRoomMt.mutate({ roomId: previousRoomId });
        }

        prevRoomId.current = roomId || null;
    }, [leaveRoomMt, location.pathname, roomId]);

    return <Outlet />;
}

export function RoomLayout() {
    const { socket } = useSocket();
    const { roomId } = useParams<{ roomId: string }>();

    useEffect(() => {
        if (!socket || !roomId) return;

        socket.emit("room:joined", { roomId });
    }, [socket, roomId]);

    return <Outlet />;
}
