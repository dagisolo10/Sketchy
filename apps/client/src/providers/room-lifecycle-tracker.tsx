import { matchPath, Outlet, useLocation, useParams } from "react-router";
import type { UseMutationResult } from "@tanstack/react-query";
import { useSocket } from "@/contexts/socket-context";
import { useLeaveRoom } from "@/hooks/tan-stack/room";
import { useEffect, useRef } from "react";


export function RoomLifecycleTracker() {
    const location = useLocation();
    const leaveRoomMt = useLeaveRoom();
    const leaveRoomMtRef = useRef<UseMutationResult<void, Error, { roomId: string }, unknown>>(null);

    useEffect(() => {
        leaveRoomMtRef.current = leaveRoomMt;
    }, [leaveRoomMt]);

    const prevRoomId = useRef<string | null>(null);
    const roomId = matchPath("/room/:roomId/*", location.pathname)?.params.roomId ?? null;

    useEffect(() => {
        const previousRoomId = prevRoomId.current;

        if (previousRoomId && previousRoomId !== roomId && leaveRoomMtRef.current) {
            leaveRoomMtRef.current.mutate({ roomId: previousRoomId });
        }

        prevRoomId.current = roomId;
    }, [location.pathname, roomId]);

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
