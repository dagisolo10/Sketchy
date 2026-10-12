import { Player } from "../models.js";

export interface PlayerServerToClientEvents {
    "player:joined": (data: { player: Player }) => void;
    "player:left:room": (data: { playerId: string }) => void;
    "player:ready:updated": (data: { player: Player }) => void;
    "player:ping:updated": (data: { playerId: string; ping: number }) => void;
}
