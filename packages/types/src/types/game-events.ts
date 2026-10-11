import { DrawingState, Game, GamePlayer, GameWinner, Role, Vote, VoteResult, VotingPhase, VotingState } from "../models.js";

export interface GameServerToClientEvents {
    "game:timer": (data: { remaining: number }) => void;
    "game:state": (data: { game: Game; drawingState: DrawingState }) => void;
    "game:round_count": (data: { round: number; drawingState: DrawingState }) => void;
    "game:next_turn": (data: { activePlayer: GamePlayer; drawingState: DrawingState }) => void;
    "game:role": (data: { role: Role; secretWord: string | null; fellowImposters: string[] }) => void;

    "game:voting:timer": (data: { remaining: number }) => void;
    "game:voting:begin": (data: { phase: VotingPhase }) => void;
    "game:voting:vote:updated": (data: { votes: Vote[] }) => void;
    "game:voting:starting": (data: { voteState: VotingState }) => void;
    "game:voting:result": (data: { phase: VotingPhase; result: VoteResult }) => void;

    "game:over": (data: { winner: GameWinner; secretWord: string }) => void;
}

export interface GameClientToServerEvents {
    "game:voting:ready": (data: { roomId: string }) => void;
    "game:voting:cast": (data: { roomId: string; targetId: string | null }) => void;

    "game:voting:continue": (data: { roomId: string }) => void;

    "game:started": (data: { roomId: string }) => void;
    "game:get:state": (data: { roomId: string }) => void;
    "game:reveal:role": (data: { roomId: string }) => void;
}
