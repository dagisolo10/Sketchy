import { DrawingClientToServerEvents, DrawingServerToClientEvents } from "./types/drawing-events.js";
import { GameClientToServerEvents, GameServerToClientEvents } from "./types/game-events.js";
import { PlayerServerToClientEvents } from "./types/player-events.js";
import { RoomClientToServerEvents, RoomServerToClientEvents } from "./types/room-events.js";

export interface ServerToClientEvents extends DrawingServerToClientEvents, GameServerToClientEvents, PlayerServerToClientEvents, RoomServerToClientEvents {
    connection_error: (error: string) => void;
}

export interface ClientToServerEvents extends DrawingClientToServerEvents, GameClientToServerEvents, RoomClientToServerEvents {}

export type ClientEvents = keyof ClientToServerEvents;
export type ServerEvents = keyof ServerToClientEvents;

export type ServerData<Event extends ServerEvents> = Parameters<ServerToClientEvents[Event]>;
export type ClientData<Event extends ClientEvents> = Parameters<ClientToServerEvents[Event]>[0];
