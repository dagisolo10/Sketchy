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
    status: RoomStatus;
};

export type RoomSettings = {
    maxPlayers: number;
    drawingTime: number;
    imposterCount: number;
};

export type RoomStatus = "waiting" | "starting" | "playing";

export type GamePlayer = Player & {
    color: string;
};

export type Point = {
    x: number;
    y: number;
};

export type Stroke = {
    tool: Tool;
    turn: number;
    color: string;
    points: Point[];
    active: boolean;
    playerId: string;
    penSize: PenSize;
};

export type DrawingState = {
    turn: number;
    strokes: Stroke[];
    undoHistory: Stroke[];
    redoHistory: Stroke[];
};

export type GamePhase = "intro" | "drawing" | "voting";

export type Game = {
    round: number;
    playing: boolean;
    remaining: number;
    imposterId: string;
    secretWord: string;
    currentIndex: number;
    players: GamePlayer[];
    activePlayer: GamePlayer;
};

export type Tool = "pen" | "eraser";
export type Role = "civilian" | "imposter";
export type PenSize = "thin" | "medium" | "thick" | "very-thick";
