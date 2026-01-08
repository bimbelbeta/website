import type { DefaultError, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

export function useDebouncedMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	delay = 1000,
): UseMutationResult<TData, TError, TVariables, TContext> & {
	debouncedMutate: (variables: TVariables) => void;
} {
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const isMountedRef = useRef(true);
	const mutation = useMutation(options);
	const mutateRef = useRef(mutation.mutate);

	// Keep the mutate ref up to date
	useEffect(() => {
		mutateRef.current = mutation.mutate;
	}, [mutation.mutate]);

	// Cleanup timeout on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const debouncedMutate = useCallback(
		(variables: TVariables) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				if (isMountedRef.current) {
					mutateRef.current(variables);
				}
			}, delay);
		},
		[delay],
	);

	return {
		...mutation,
		debouncedMutate,
	};
}
