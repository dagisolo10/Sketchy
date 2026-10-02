import { Player } from "@/types/models.js";
import { DefaultEventsMap, Server, Socket } from "socket.io";

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export interface SocketData {
    player: Player;
    sessionId: string;
}
export interface ServerToClientEvents {}
export interface ClientToServerEvents {
    connect: () => void;
}

export type ClientEvents = keyof ClientToServerEvents;
export type ServerEvents = keyof ServerToClientEvents;

export type ClientData<Event extends ClientEvents> = Parameters<ClientToServerEvents[Event]>[0];
export type ServerData<Event extends ServerEvents> = Parameters<ServerToClientEvents[Event]>;
