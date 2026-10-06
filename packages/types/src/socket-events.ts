import { Game, GamePlayer, Role, Room } from "./models.js";

export interface ServerToClientEvents {
    connection_error: (error: string) => void;

    "player:joined": (data: { roomId: string }) => void;
    "player:left:room": (data: { roomId: string }) => void;
    "player:ready:updated": (data: { roomId: string }) => void;

    "room:state": (data: { room: Room }) => void;
    "room:game:started": (data: { roomId: string }) => void;
    "room:game:starting": (data: { roomId: string }) => void;
    "room:game:countdown": (data: { count: number }) => void;

    "game:state": (data: { game: Game }) => void;
    "game:role": (data: { role: Role; secretWord: string | null }) => void;

    // ! unused by client
    "game:timer": (data: { remaining: number }) => void;
    "game:round_count": (data: { round: number }) => void;
    "game:next_turn": (data: { activePlayer: GamePlayer }) => void;
}

export interface ClientToServerEvents {
    "game:started": (data: { roomId: string }) => void;
    "game:reveal:role": (data: { roomId: string }) => void;
    "game:get:state": (data: { roomId: string }) => void;
    "room:get:state": (data: { roomId: string }) => void;
    "room:joined": (data: { roomId: string }) => void;
}

export type ClientEvents = keyof ClientToServerEvents;
export type ServerEvents = keyof ServerToClientEvents;

export type ServerData<Event extends ServerEvents> = Parameters<ServerToClientEvents[Event]>;
export type ClientData<Event extends ClientEvents> = Parameters<ClientToServerEvents[Event]>;
