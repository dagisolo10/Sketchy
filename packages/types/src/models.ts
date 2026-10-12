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
    ping: number | null;
};
export type Room = {
    roomId: string;
    hostId: string;
    players: Player[];
    countdown: number;
    status: RoomStatus;
    settings: RoomSettings;
};
export type RoomSettings = {
    imposters: number;
    maxPlayers: number;
    drawingTime: number;
};
export type RoomStatus = "waiting" | "starting" | "playing";

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
export type GamePlayer = Player & {
    color: string;
    eliminated: boolean;
};
export type Game = {
    round: number;
    playing: boolean;
    remaining: number;
    drawingTime: number;
    secretWord: string;
    currentIndex: number;
    players: GamePlayer[];
    imposters: GamePlayer[];
    activePlayer: GamePlayer;
};
export type Tool = "pen" | "eraser";
export type Role = "civilian" | "imposter";
export type GameWinner = "civilians" | "imposters";
export type PenSize = "thin" | "medium" | "thick" | "very-thick";

export type EliminatedPlayer = {
    playerId: string;
    name: string;
    role: Role;
};

export type VoteResult = EliminatedPlayer | null;
export type VotingPhase = "idle" | "intro" | "voting" | "result";
export type Vote = {
    voterId: string;
    submitted: boolean;
    voteeId: string | null;
};
export type VotingState = {
    round: number;
    votes: Vote[];
    remaining: number;
    phase: VotingPhase;
    result: VoteResult | null;
};
