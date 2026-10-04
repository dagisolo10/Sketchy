export type PlayerPayload = {
    name: string;
};

export type Player = {
    name: string;
    playerId: string;
};

export type Room = RoomSettings & {
    roomId: string;
    hostId: string;
    players: Player[];
};

export type RoomSettings = {
    maxPlayers: number;
    drawingTime: number;
    imposterCount: number;
};
