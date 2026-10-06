import { api, requestApi } from "@/lib/axios";
import type { Player, PlayerNamePayload } from "@package/types";
import type { TMutationOptions, TQueryOptions } from "@/types/options";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetOrCreateSession<Data = Player>(options?: TQueryOptions<Data>) {
    return useQuery({
        ...options,
        retry: 2,
        queryKey: ["session"],
        queryFn: async () => requestApi(() => api.get<Data>("/session")),
    });
}

export function useUpdatePlayerName(options?: TMutationOptions<Player, PlayerNamePayload>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data) => requestApi(() => api.patch<Player>("/session", data)),
        onSuccess: (...args) => {
            queryClient.setQueryData<Player>(["session"], args[0]);
            if (options?.onSuccess) options.onSuccess(...args);
        },
        onError: (...args) => options?.onError && options.onError(...args),
    });
}
