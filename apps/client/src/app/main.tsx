import "@/app/index.css";

import { gsap } from "gsap";
import Intro from "@/pages/intro";
import HomePage from "@/pages/home";
import PlayPage from "@/pages/play";
import RoomPage from "@/pages/room";
import NotFound from "@/pages/not-found";
import { createRoot } from "react-dom/client";
import GameCanvasPage from "@/pages/game-canvas";
import AuthProvider from "@/providers/auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import SocketProvider from "@/providers/socket.provider";
import { BrowserRouter, Route, Routes } from "react-router";
import { ScrollSmoother, ScrollTrigger, SplitText } from "gsap/all";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SocketProvider>
                <ToastProvider position="top-center">
                    <BrowserRouter>
                        <Routes>
                            <Route path="/imposter" element={<Intro role={"imposter"} secretWord={null} onComplete={() => {}} />} />
                            <Route path="/civilian" element={<Intro role={"civilian"} secretWord={"Nut Cracker"} onComplete={() => {}} />} />

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
