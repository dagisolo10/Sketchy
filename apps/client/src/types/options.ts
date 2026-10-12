import type { ApiRequestError } from "@/lib/axios";
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export type TQueryOptions<TQueryData> = Omit<UseQueryOptions<TQueryData, ApiRequestError, TQueryData>, "queryKey" | "queryFn">;
export type TMutationOptions<TData, TVariables = void, TOnMutateResult = unknown> = Omit<UseMutationOptions<TData, ApiRequestError, TVariables, TOnMutateResult>, "mutationFn">;
