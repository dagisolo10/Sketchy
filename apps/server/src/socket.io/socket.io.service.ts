import { Injectable } from "@nestjs/common";
import { TypedServer } from "@/types/socket.js";
import { ServerData, ServerEvents } from "@package/types";

@Injectable()
export class SocketIoService {
    private server!: TypedServer;

    setServer(server: TypedServer) {
        this.server = server;
    }

    emit<Event extends ServerEvents>(event: Event, ...args: ServerData<Event>) {
        this.server.emit(event, ...args);
    }

    emitTo<Event extends ServerEvents>(event: Event, to: string, ...args: ServerData<Event>) {
        this.server.to(to).emit(event, ...args);
    }
}
