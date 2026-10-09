import "@/app/index.css";

import { ToastProvider } from "@/components/ui/toast";
import GameCanvasPage from "@/pages/game-canvas";
import GameIntroPage from "@/pages/game-intro";
import HomePage from "@/pages/home";
import NotFound from "@/pages/not-found";
import PlayPage from "@/pages/play";
import RoomPage from "@/pages/room";
import AuthProvider from "@/providers/auth-provider";
import { RoomLayout, RoomLifecycleTracker } from "@/providers/room-lifecycle-tracker";
import SocketProvider from "@/providers/socket.provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollSmoother, ScrollTrigger, SplitText } from "gsap/all";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SocketProvider>
                <ToastProvider position="top-center">
                    <BrowserRouter>
                        <Routes>
                            <Route element={<RoomLifecycleTracker />}>
                                <Route path="*" Component={NotFound} />
                                <Route path="/" Component={HomePage} />
                                <Route path="/play" Component={PlayPage} />
                                <Route element={<RoomLayout />} path="/room/:roomId">
                                    <Route index Component={RoomPage} />
                                    <Route path="intro" Component={GameIntroPage} />
                                    <Route path="game" Component={GameCanvasPage} />
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </SocketProvider>
        </AuthProvider>
    </QueryClientProvider>,
);
