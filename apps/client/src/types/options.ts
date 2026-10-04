import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export type TQueryOptions<TQueryData> = Omit<UseQueryOptions<TQueryData, Error, TQueryData>, "queryKey" | "queryFn">;
export type TMutationOptions<TData, TVariables = void, TOnMutateResult = unknown> = Omit<UseMutationOptions<TData, Error, TVariables, TOnMutateResult>, "mutationFn">;
