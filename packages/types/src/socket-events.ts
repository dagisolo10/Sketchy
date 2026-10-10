import { DrawingState, Game, GamePlayer, PenSize, Player, Point, Role, Room, RoomStatus, Tool } from "./models.js";

export interface ServerToClientEvents {
    connection_error: (error: string) => void;

    "player:joined": (data: { player: Player }) => void;
    "player:left:room": (data: { playerId: string }) => void;
    "player:ready:updated": (data: { player: Player }) => void;

    "room:state": (data: { room: Room }) => void;
    "room:game:starting": (data: { status: RoomStatus }) => void;
    "room:game:intro:started": (data: { roomId: string }) => void;
    "room:game:countdown": (data: { roomId: string; countdown: number }) => void;

    "game:timer": (data: { remaining: number }) => void;
    "game:next_turn": (data: { activePlayer: GamePlayer; drawingState: DrawingState }) => void;
    "game:role": (data: { role: Role; secretWord: string | null }) => void;
    "game:state": (data: { game: Game; drawingState: DrawingState }) => void;
    "game:round_count": (data: { round: number; drawingState: DrawingState }) => void;

    "drawing:end": (data: { drawingState: DrawingState }) => void;
    "drawing:undo": (data: { drawingState: DrawingState }) => void;
    "drawing:redo": (data: { drawingState: DrawingState }) => void;
    "drawing:move": (data: { point: Point; color: string }) => void;
    "drawing:start": (data: { point: Point; penSize: PenSize; tool: Tool; color: string; turn: number }) => void;
}

export interface ClientToServerEvents {
    "drawing:end": (data: { roomId: string }) => void;
    "drawing:next": (data: { roomId: string }) => void;
    "drawing:undo": (data: { roomId: string }) => void;
    "drawing:redo": (data: { roomId: string }) => void;
    "drawing:move": (data: { point: Point; roomId: string }) => void;
    "drawing:start": (data: { point: Point; penSize: PenSize; tool: Tool; roomId: string }) => void;

    "room:joined": (data: { roomId: string }) => void;
    "game:started": (data: { roomId: string }) => void;
    "game:get:state": (data: { roomId: string }) => void;
    "room:get:state": (data: { roomId: string }) => void;

    "game:reveal:role": (data: { roomId: string }) => void;
}

export type ClientEvents = keyof ClientToServerEvents;
export type ServerEvents = keyof ServerToClientEvents;

export type ServerData<Event extends ServerEvents> = Parameters<ServerToClientEvents[Event]>;
export type ClientData<Event extends ClientEvents> = Parameters<ClientToServerEvents[Event]>;
