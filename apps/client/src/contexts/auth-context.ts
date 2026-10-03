import type { Player } from "@package/types";
import { createContext, useContext } from "react";

type AuthContextType = {
    player: Player | null;
};

export const AuthContext = createContext<AuthContextType>({
    player: null,
});

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("Wrap the app with AuthProvider");
    }

    return context;
}
