import { api, requestApi } from "@/lib/axios";
import { useSocket } from "@/contexts/socket-context";
import type { Player, PlayerNamePayload } from "@package/types";
import type { TMutationOptions, TQueryOptions } from "@/types/options";
import { getStoredPlayerName, setStoredPlayerName } from "@/utils/player-name";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGetOrCreateSession<Data = Player>(options?: TQueryOptions<Data>) {
    return useQuery({
        ...options,
        retry: 2,
        queryKey: ["session"],
        queryFn: async () => {
            const name = getStoredPlayerName();

            return requestApi(() => api.get<Data>("/session", { params: name ? { name } : undefined }));
        },
    });
}

export type OnlineCount = { online: number };

export function useOnlineCount(options?: TQueryOptions<OnlineCount>) {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const query = useQuery({
        ...options,
        queryKey: ["session", "online"],
        queryFn: async () => requestApi(() => api.get<OnlineCount>("/session/online")),
    });

    useEffect(() => {
        if (!socket) return;

        const handler = ({ online }: OnlineCount) => queryClient.setQueryData<OnlineCount>(["session", "online"], { online });

        socket.on("session:online", handler);

        return () => {
            socket.off("session:online", handler);
        };
    }, [queryClient, socket]);

    return query;
}

export function useUpdatePlayerName(options?: TMutationOptions<Player, PlayerNamePayload>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data) => requestApi(() => api.patch<Player>("/session", data)),
        onSuccess: (...args) => {
            setStoredPlayerName(args[0].name);
            queryClient.setQueryData<Player>(["session"], args[0]);
            if (options?.onSuccess) options.onSuccess(...args);
        },
        onError: (...args) => options?.onError && options.onError(...args),
    });
}
