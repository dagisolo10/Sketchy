import IntroPage from "@/components/intro";
import { useSocket } from "@/contexts/socket-context";
import type { Role } from "@package/types";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function GameIntroPage() {
    const { roomId = "" } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { socket } = useSocket();

    const hasEmittedRef = useRef(false);
    const [role, setRole] = useState<Role | null>(null);
    const [secretWord, setSecretWord] = useState<string | null>(null);

    useEffect(() => {
        if (!socket || !roomId) return;

        socket.on("game:role", ({ role, secretWord }) => {
            setRole(role);
            setSecretWord(secretWord);
        });

        socket.emit("game:reveal:role", { roomId });

        return () => {
            socket.off("game:role");
        };
    }, [roomId, socket]);

    const handleIntroComplete = () => {
        if (hasEmittedRef.current) return;

        hasEmittedRef.current = true;
        if (socket) socket.emit("game:started", { roomId });

        navigate(`/room/${roomId}/game`, { replace: true });
    };

    if (!role) {
        return null;
    }

    return <IntroPage role={role} secretWord={secretWord} onComplete={handleIntroComplete} />;
}
