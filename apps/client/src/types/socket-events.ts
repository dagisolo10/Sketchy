import { Socket } from "socket.io-client";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ServerToClientEvents {
    connect: () => void;
}

export interface ClientToServerEvents {
    connect: () => void;
}

export type ClientEvents = keyof ClientToServerEvents;
export type ServerEvents = keyof ServerToClientEvents;

export type ServerData<Event extends ServerEvents> = Parameters<ServerToClientEvents[Event]>;
export type ClientData<Event extends ClientEvents> = Parameters<ClientToServerEvents[Event]>;
