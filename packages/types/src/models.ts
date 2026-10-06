export type PlayerNamePayload = {
    name: string;
};
export type PlayerReadyPayload = {
    ready: boolean;
    roomId: string;
};

export type Player = {
    name: string;
    ready: boolean;
    playerId: string;
};

export type Room = RoomSettings & {
    roomId: string;
    hostId: string;
    players: Player[];
    countdown: number;
    status: GameStatus;
};

export type RoomSettings = {
    maxPlayers: number;
    drawingTime: number;
    imposterCount: number;
};

export type GameStatus = "waiting" | "starting" | "playing";

