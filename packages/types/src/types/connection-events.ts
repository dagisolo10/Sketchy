export interface ConnectionClientToServerEvents {
    "connection:update": (data: { ping: number }) => void;
    "connection:ping": (ack: (serverTime: number) => void) => void;
}
