import { ClientToServerEvents, Player, ServerToClientEvents } from "@package/types";
import { DefaultEventsMap, Server, Socket } from "socket.io";

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export interface SocketData {
    player: Player;
    sessionId: string;
}
