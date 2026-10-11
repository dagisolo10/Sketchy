import type { TypedSocket } from "@/contexts/socket-context";
import type { Player, VotingState } from "@package/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const ALLOW_SELF_VOTE = false;

const INITIAL_STATE: VotingState = {
    round: 1,
    votes: [],
    phase: "idle",
    result: null,
    remaining: 0,
};

export default function useVoting({ roomId, socket, player }: { roomId: string; socket: TypedSocket | null; player: Player | undefined }) {
    const introDoneRef = useRef(false);
    const [targetId, setTargetId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [voteState, setVoteState] = useState<VotingState>(INITIAL_STATE);

    useEffect(() => {
        if (!socket) return;

        socket.on("game:voting:begin", ({ phase }) => setVoteState((prev) => ({ ...prev, phase })));
        socket.on("game:voting:vote:updated", ({ votes }) => {
            setVoteState((prev) => ({ ...prev, votes }));

            setSubmitted(votes.find((vote) => vote.voterId === player?.playerId)?.submitted ?? false);
        });
        socket.on("game:voting:timer", ({ remaining }) => setVoteState((prev) => ({ ...prev, remaining })));
        socket.on("game:voting:result", ({ result, phase }) => setVoteState((prev) => ({ ...prev, phase, result })));
        socket.on("game:voting:starting", ({ voteState }) => {
            introDoneRef.current = false;
            setTargetId(null);
            setSubmitted(false);
            setVoteState(voteState);
        });

        return () => {
            socket.off("game:voting:begin");
            socket.off("game:voting:timer");
            socket.off("game:voting:result");
            socket.off("game:voting:starting");
            socket.off("game:voting:vote:updated");
        };
    }, [player?.playerId, socket]);

    const completeIntro = useCallback(() => {
        if (voteState.phase !== "intro" || introDoneRef.current || !socket) return;

        introDoneRef.current = true;

        socket.emit("game:voting:ready", { roomId });
    }, [roomId, socket, voteState.phase]);

    const selectVote = useCallback((target: string | null) => setTargetId(target), []);

    const submitVote = useCallback(() => {
        const hasVoted = voteState.votes.find((vote) => vote.voterId === player?.playerId)?.submitted ?? false;
        if (voteState.phase !== "voting" || hasVoted || !socket) return;

        setSubmitted(true);

        socket.emit("game:voting:cast", { roomId, targetId: targetId === "skip" ? null : targetId });
    }, [player?.playerId, roomId, socket, targetId, voteState.phase, voteState.votes]);

    const completeResult = useCallback(() => {
        if (voteState.phase !== "result" || !socket) return;

        socket.emit("game:voting:continue", { roomId });

        setVoteState((prev) => ({ ...prev, phase: "idle" }));
    }, [roomId, socket, voteState.phase]);

    return { state: voteState, targetId, submitted, completeIntro, selectVote, submitVote, completeResult };
}
