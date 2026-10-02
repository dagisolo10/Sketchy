import "@/app/index.css";

import App from "@/app/App.tsx";
import AuthProvider from "@/providers/auth-provider";
import SocketProvider from "@/providers/socket.provider";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
    // <StrictMode>
    <AuthProvider>
        <SocketProvider>
            <App />,
        </SocketProvider>
    </AuthProvider>,
    // </StrictMode>
);
