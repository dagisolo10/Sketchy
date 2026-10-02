import { AuthContext } from "@/contexts/auth-context";
import { api, requestApi } from "@/lib/axios";
import type { LoginDto, Player } from "@/types/models";
import { useEffect, useState, type PropsWithChildren } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
    const [player, setPlayer] = useState<Player | null>(null);

    useEffect(() => {
        async function getSession(data: LoginDto) {
            try {
                const player = await requestApi(() => api.post<Player>("/auth/session", data));

                setPlayer(player);
            } catch (error) {
                console.log("Error while logging in:", error);
            }
        }

        getSession({ name: "Ayakashi" });
    }, []);

    return <AuthContext.Provider value={{ player }}>{children}</AuthContext.Provider>;
}
