import { TypedServer, TypedSocket } from "@/types/socket.js";
import { Injectable } from "@nestjs/common";
import { ServerData, ServerEvents } from "@package/types";

@Injectable()
export class SocketIoService {
    private server!: TypedServer;
    private playerSockets = new Map<string, TypedSocket>();

    setServer(server: TypedServer) {
        this.server = server;
    }

    emit<Event extends ServerEvents>(event: Event, ...args: ServerData<Event>) {
        this.server.emit(event, ...args);
    }

    emitTo<Event extends ServerEvents>(event: Event, to: string, ...args: ServerData<Event>) {
        this.server.to(to).emit(event, ...args);
    }

    getPlayerSocket(playerId: string) {
        return this.playerSockets.get(playerId);
    }

    setPlayerSocket(playerId: string, socket: TypedSocket) {
        this.playerSockets.set(playerId, socket);
    }

    removePlayerSocket(playerId: string) {
        this.playerSockets.delete(playerId);
    }
}
