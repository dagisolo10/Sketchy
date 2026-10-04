import "@/app/index.css";

import HomePage from "@/pages/home";
import PlayPage from "@/pages/play";
import RoomPage from "@/pages/room";
import NotFound from "@/pages/not-found";
import { createRoot } from "react-dom/client";
import GameCanvasPage from "@/pages/game-canvas";
import AuthProvider from "@/providers/auth-provider";
import SocketProvider from "@/providers/socket.provider";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SocketProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="*" Component={NotFound} />
                        <Route path="/" Component={HomePage} />
                        <Route path="/play" Component={PlayPage} />
                        <Route path="/room/:roomId" Component={RoomPage} />
                        <Route path="/game/:roomId" Component={GameCanvasPage} />
                    </Routes>
                </BrowserRouter>
            </SocketProvider>
        </AuthProvider>
    </QueryClientProvider>,
);
