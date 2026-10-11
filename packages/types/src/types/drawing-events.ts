import { DrawingState, PenSize, Point, Tool } from "../models.js";

export interface DrawingServerToClientEvents {
    "drawing:end": (data: { drawingState: DrawingState }) => void;
    "drawing:undo": (data: { drawingState: DrawingState }) => void;
    "drawing:redo": (data: { drawingState: DrawingState }) => void;
    "drawing:move": (data: { point: Point; color: string }) => void;
    "drawing:start": (data: { point: Point; penSize: PenSize; tool: Tool; color: string; turn: number }) => void;
}

export interface DrawingClientToServerEvents {
    "drawing:end": (data: { roomId: string }) => void;
    "drawing:next": (data: { roomId: string }) => void;
    "drawing:undo": (data: { roomId: string }) => void;
    "drawing:redo": (data: { roomId: string }) => void;
    "drawing:move": (data: { point: Point; roomId: string }) => void;
    "drawing:start": (data: { point: Point; penSize: PenSize; tool: Tool; roomId: string }) => void;
}
