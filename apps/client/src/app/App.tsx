import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useSocket } from "@/contexts/socket-context";
import { api, requestApi } from "@/lib/axios";
import { Wifi } from "lucide-react";

export default function App() {
    const { player } = useAuth();
    const { socket, connected } = useSocket();

    async function logout() {
        try {
            await requestApi(() => api.delete<void>("/auth/session"));

            socket?.disconnect();
        } catch (error) {
            console.log("Error while logging out", error);
        }
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <div>
                <p className="text-2xl">
                    Socket <Wifi /> <span className="font-bold">{connected ? "🟢 Connected" : "❌ Not Connected"}</span>
                </p>
            </div>

            <p className="text-center text-2xl">
                Player name: <span className="text-primary font-bold">{player?.name}</span>
            </p>

            <Button onClick={logout}>Logout</Button>
        </div>
    );
}
