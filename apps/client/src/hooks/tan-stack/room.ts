import { api, requestApi } from "@/lib/axios";
import type { TMutationOptions, TQueryOptions } from "@/types/options";
import type { Player, PlayerReadyPayload, Room, RoomSettings } from "@package/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetRoom<Data = Room>(roomId: string, options?: TQueryOptions<Data>) {
    return useQuery({
        ...options,
        queryKey: ["room", roomId],
        queryFn: async () => requestApi(() => api.get<Data>(`/room/${roomId}`)),
    });
}

export function useCreateRoom<Data = Room>(options?: TMutationOptions<Data, RoomSettings>) {
    return useMutation({
        ...options,
        onError: (...args) => options?.onError && options.onError(...args),
        mutationFn: async (data) => requestApi(() => api.post<Data>("/room", data)),
        onSuccess: (...args) => options?.onSuccess && options.onSuccess(...args),
    });
}

export function useJoinRoom<Data = Room>(options?: TMutationOptions<Data, { roomId: string }>) {
    return useMutation({
        ...options,
        onError: (...args) => options?.onError && options.onError(...args),
        mutationFn: async ({ roomId }) => requestApi(() => api.post<Data>("/room/join/" + roomId)),
        onSuccess: (...args) => options?.onSuccess && options.onSuccess(...args),
    });
}

export function useLeaveRoom<Data = void>(options?: TMutationOptions<Data, { roomId: string }>) {
    return useMutation({
        ...options,
        onError: (...args) => options?.onError && options.onError(...args),
        mutationFn: async ({ roomId }) => requestApi(() => api.delete<Data>("/room/leave/" + roomId)),
        onSuccess: (...args) => options?.onSuccess && options.onSuccess(...args),
    });
}

export function usePlayerReady(options?: TMutationOptions<Player, PlayerReadyPayload>) {
    return useMutation({
        ...options,
        onError: (...args) => options?.onError && options.onError(...args),
        mutationFn: async ({ ready, roomId }) => requestApi(() => api.patch<Player>(`/room/${roomId}/${ready ? "ready" : "not-ready"}`)),
        onSuccess: (...args) => options?.onSuccess && options.onSuccess(...args),
    });
}

export function useStartGame(options?: TMutationOptions<Room, { roomId: string }>) {
    return useMutation({
        ...options,
        onError: (...args) => options?.onError && options.onError(...args),
        mutationFn: async ({ roomId }) => requestApi(() => api.post(`/room/${roomId}/start-game`)),
        onSuccess: (...args) => options?.onSuccess && options.onSuccess(...args),
    });
}

// export function useDeleteRoom<Data = void>(options?: TMutationOptions<Data, { roomId: string }>) {
//     return useMutation({
//         ...options,
//         mutationFn: async ({ roomId }) => requestApi(() => api.delete<Data>("/room/" + roomId)),
//     });
// }
