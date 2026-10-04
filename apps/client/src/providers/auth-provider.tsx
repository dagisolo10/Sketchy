import { useGetOrCreateSession } from "@/hooks/tan-stack/session";
import { type PropsWithChildren } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
    useGetOrCreateSession();

    return <>{children}</>;
}
