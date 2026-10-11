import { Room, RoomSettings, RoomStatus } from "../models.js";

export interface RoomServerToClientEvents {
    "room:state": (data: { room: Room }) => void;
    "room:game:starting": (data: { status: RoomStatus }) => void;
    "room:game:intro:started": (data: { roomId: string }) => void;
    "room:settings:updated": (data: { settings: RoomSettings }) => void;
    "room:game:countdown": (data: { roomId: string; countdown: number }) => void;
}

export interface RoomClientToServerEvents {
    "room:joined": (data: { roomId: string }) => void;
    "room:get:state": (data: { roomId: string }) => void;
}
