import type { appRouter } from "@bimbelbeta/api/routers/index";
import { createORPCClient, type InferClientBodyOutputs, isDefinedError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function getApiUrl() {
	return (
		process.env.VITE_SERVER_URL ??
		import.meta.env.VITE_SERVER_URL ??
		(process.env.NODE_ENV === "production" ? "https://api.bimbelbeta.id" : "http://localhost:3001")
	);
}

const serializer = new StandardRPCJsonSerializer();
export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			if (isDefinedError(error))
				toast.error(`${error}`, {
					action: {
						label: "Retry",
						onClick: () => {
							queryClient.invalidateQueries();
						},
					},
				});
			else
				toast.error("An unexpected error occurred", {
					description: error.message,
				});
		},
	}),
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			queryKeyHashFn(queryKey) {
				const [json, meta] = serializer.serialize(queryKey);
				return JSON.stringify({ json, meta });
			},
			staleTime: 60 * 1000,
		},
		dehydrate: {
			serializeData(data) {
				const [json, meta] = serializer.serialize(data);
				return { json, meta };
			},
		},
		hydrate: {
			deserializeData(data) {
				return serializer.deserialize(data.json, data.meta);
			},
		},
	},
});

const client: RouterClient<typeof appRouter> = createORPCClient(
	new RPCLink({
		url: `${getApiUrl()}/rpc`,
		fetch(url, options) {
			return fetch(url, {
				...options,
				credentials: "include",
			});
		},
	}),
);

export type BodyOutputs = InferClientBodyOutputs<typeof client>;

export const orpc = createTanstackQueryUtils(client);
