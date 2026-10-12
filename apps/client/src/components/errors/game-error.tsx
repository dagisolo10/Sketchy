import ErrorState from "@/components/error-state";
import type { ApiRequestError } from "@/lib/axios";
import { ErrorCode } from "@package/types";

export default function GameError({ error, onRetry, retrying }: { error?: ApiRequestError | null; onRetry?: () => void; retrying?: boolean }) {
    const isMissing = error?.code === ErrorCode.ROOM_NOT_FOUND || error?.status === 404;
    const isSession = error?.code === ErrorCode.SESSION_MISSING || error?.code === ErrorCode.NOT_IN_SESSION || error?.code === ErrorCode.SESSION_INACTIVE;

    if (isMissing) {
        return (
            <ErrorState
                code="404"
                codeLabel={error?.code}
                tone="warning"
                title="Game not found"
                message={error?.message ?? "This game's room no longer exists. It may have ended or been closed by the host."}
                onRetry={onRetry}
                retrying={retrying}
            />
        );
    }

    if (isSession) {
        return (
            <ErrorState
                code="401"
                codeLabel={error?.code}
                tone="warning"
                title="Session expired"
                message={error?.message ?? "Your session has expired. Please refresh the page to rejoin the game."}
                onRetry={onRetry}
                retrying={retrying}
            />
        );
    }

    return (
        <ErrorState
            code="ERROR"
            codeLabel={error?.code}
            tone="danger"
            title="Couldn't load the game"
            message={error?.message ?? "Something went wrong while loading this game. Please try again in a moment."}
            onRetry={onRetry}
            retrying={retrying}
        />
    );
}
