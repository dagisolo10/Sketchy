import "@/app/index.css";

import ErrorBoundary from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/contexts/theme-provider";
import GameCanvasPage from "@/pages/game-canvas";
import GameIntroPage from "@/pages/game-intro";
import HomePage from "@/pages/home";
import NotFound from "@/pages/not-found";
import PlayPage from "@/pages/play";
import RoomPage from "@/pages/room";
import UiShowcase from "@/pages/ui-showcase";
import AuthProvider from "@/providers/auth-provider";
import ConnectionSignalProvider from "@/providers/connection-signal.provider";
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
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider position="top-center">
                    <SocketProvider>
                        <ConnectionSignalProvider>
                            <ErrorBoundary>
                                <BrowserRouter>
                                    <Routes>
                                        <Route element={<RoomLifecycleTracker />}>
                                            <Route index Component={HomePage} />
                                            <Route path="*" Component={NotFound} />
                                            <Route path="play" Component={PlayPage} />

                                            <Route element={<RoomLayout />} path="/room/:roomId">
                                                <Route index Component={RoomPage} />
                                                <Route path="intro" Component={GameIntroPage} />
                                                <Route path="game" Component={GameCanvasPage} />
                                            </Route>

                                            <Route path="ui" Component={UiShowcase} />
                                            <Route path="ui/:section" Component={UiShowcase} />
                                        </Route>
                                    </Routes>
                                </BrowserRouter>
                            </ErrorBoundary>
                        </ConnectionSignalProvider>
                    </SocketProvider>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>,
);
