import "@/app/index.css";

import { ToastProvider } from "@/components/ui/toast";
import GameCanvasPage from "@/pages/game-canvas";
import HomePage from "@/pages/home";
import NotFound from "@/pages/not-found";
import PlayPage from "@/pages/play";
import RoomPage from "@/pages/room";
import AuthProvider from "@/providers/auth-provider";
import SocketProvider from "@/providers/socket.provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SocketProvider>
                <ToastProvider position="top-center">
                    <BrowserRouter>
                        <Routes>
                            <Route path="*" Component={NotFound} />
                            <Route path="/" Component={HomePage} />
                            <Route path="/play" Component={PlayPage} />
                            <Route path="/room/:roomId" Component={RoomPage} />
                            <Route path="/game/:roomId" Component={GameCanvasPage} />
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </SocketProvider>
        </AuthProvider>
    </QueryClientProvider>,
);
