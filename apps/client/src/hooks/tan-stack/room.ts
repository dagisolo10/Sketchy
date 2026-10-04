import { api, requestApi } from "@/lib/axios";
import type { TMutationOptions, TQueryOptions } from "@/types/options";
import type { Room, RoomSettings } from "@package/types";
import { useMutation, useQuery } from "@tanstack/react-query";

// export function useGetRooms<Data = Room[]>(options?: TQueryOptions<Data>) {
//     return useQuery({
//         ...options,
//         queryKey: ["rooms"],
//         queryFn: async () => requestApi(() => api.get<Data>("/room")),
//     });
// }

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
        mutationFn: async (data) => requestApi(() => api.post<Data>("/room", data)),
    });
}

export function useJoinRoom<Data = Room>(options?: TMutationOptions<Data, { roomId: string }>) {
    return useMutation({
        ...options,
        mutationFn: async ({ roomId }) => requestApi(() => api.post<Data>("/room/join/" + roomId)),
    });
}

export function useLeaveRoom<Data = void>(options?: TMutationOptions<Data, { roomId: string }>) {
    return useMutation({
        ...options,
        mutationFn: async ({ roomId }) => requestApi(() => api.delete<Data>("/room/leave/" + roomId)),
    });
}

// export function useDeleteRoom<Data = void>(options?: TMutationOptions<Data, { roomId: string }>) {
//     return useMutation({
//         ...options,
//         mutationFn: async ({ roomId }) => requestApi(() => api.delete<Data>("/room/" + roomId)),
//     });
// }
