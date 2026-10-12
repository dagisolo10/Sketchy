export interface SessionServerToClientEvents {
    "session:online": (data: { online: number }) => void;
}