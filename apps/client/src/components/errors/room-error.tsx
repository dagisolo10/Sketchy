import ErrorState from "@/components/error-state";
import type { ApiRequestError } from "@/lib/axios";
import { ErrorCode } from "@package/types";

export default function RoomError({ error, onRetry, retrying }: { error?: ApiRequestError | null; onRetry?: () => void; retrying?: boolean }) {
    const isMissing = error?.code === ErrorCode.ROOM_NOT_FOUND || error?.status === 404;
    const isSession = error?.code === ErrorCode.SESSION_MISSING || error?.code === ErrorCode.NOT_IN_SESSION || error?.code === ErrorCode.SESSION_INACTIVE;

    if (isMissing) {
        return (
            <ErrorState
                code="404"
                codeLabel={error?.code}
                tone="warning"
                title="Room not found"
                message={error?.message ?? "We couldn't find that room. It may have been closed or the room code is incorrect."}
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
                message={error?.message ?? "Your session has expired. Please refresh the page to start a new one."}
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
            title="Couldn't load the room"
            message={error?.message ?? "Something went wrong while loading this room. Please try again in a moment."}
            onRetry={onRetry}
            retrying={retrying}
        />
    );
}
