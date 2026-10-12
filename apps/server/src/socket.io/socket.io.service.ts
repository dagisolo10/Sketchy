import { TypedServer, TypedSocket } from "@/types/socket.js";
import { Injectable } from "@nestjs/common";
import { ServerData, ServerEvents } from "@package/types";

@Injectable()
export class SocketIoService {
    private server!: TypedServer;
    private playerSockets = new Map<string, TypedSocket>();
    private onlinePlayers = new Map<string, number>();

    setServer(server: TypedServer) {
        this.server = server;
    }

    getOnlineCount() {
        return this.onlinePlayers.size;
    }

    incrementOnline(playerId: string) {
        const count = (this.onlinePlayers.get(playerId) ?? 0) + 1;

        this.onlinePlayers.set(playerId, count);

        if (count === 1) {
            this.emit("session:online", { online: this.onlinePlayers.size });
        }
    }

    decrementOnline(playerId: string) {
        if (!this.onlinePlayers.has(playerId)) return this.onlinePlayers.size;

        const count = (this.onlinePlayers.get(playerId) ?? 1) - 1;

        if (count > 0) {
            this.onlinePlayers.set(playerId, count);
        } else {
            this.onlinePlayers.delete(playerId);
            this.emit("session:online", { online: this.onlinePlayers.size });
        }

        return;
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

    removePlayerSocket(playerId: string, socket: TypedSocket) {
        if (this.playerSockets.get(playerId) === socket) this.playerSockets.delete(playerId);
    }
}
