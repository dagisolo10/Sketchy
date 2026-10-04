import { api, requestApi } from "@/lib/axios";
import type { TMutationOptions, TQueryOptions } from "@/types/options";
import type { Player, PlayerPayload } from "@package/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetOrCreateSession<Data = Player>(options?: TQueryOptions<Data>) {
    return useQuery({
        ...options,
        queryKey: ["session"],
        queryFn: async () => requestApi(() => api.get<Data>("/session")),
    });
}

export function useUpdatePlayerName(options?: TMutationOptions<Player, PlayerPayload>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        onSuccess: (player) => queryClient.setQueryData<Player>(["session"], player),
        mutationFn: async (data) => requestApi(() => api.patch<Player>("/session", data)),
    });
}
