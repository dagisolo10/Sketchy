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

export type GamePlayer = Player & {
    color: string;
};

export type Point = {
    x: number;
    y: number;
};

export type Stroke = {
    color: string;
    userId: string;
    points: Point[];
    active: boolean;
};

export type GamePhase = "intro" | "drawing" | "voting";

export type Game = {
    round: number;
    playing: boolean;
    strokes: Stroke[];
    imposterId: string;
    secretWord: string;
    currentIndex: number;
    players: GamePlayer[];
    activePlayer: GamePlayer;
};

export type Role = "civilian" | "imposter";
