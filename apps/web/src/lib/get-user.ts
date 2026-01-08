import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { RouterAppContext } from "@/routes/__root";
import { authClient } from "./auth-client";

export const getUser = createServerFn().handler(async () => {
	const headers = getRequestHeaders();
	const headersToForward = {
		cookie: headers.get("cookie") || "",
		"user-agent": headers.get("user-agent"),
	};

	const { data } = await authClient.getSession({
		fetchOptions: {
			headers: headersToForward,
		},
	});

	return data;
});

export const $getSession = createIsomorphicFn()
	.client(async (queryClient: RouterAppContext["queryClient"]) => {
		const { data: session } = await queryClient.fetchQuery({
			queryFn: () => authClient.getSession(),
			queryKey: ["auth", "getSession"],
			staleTime: 60_000,
		});

		return {
			session,
		};
	})
	.server(async (_: RouterAppContext["queryClient"]) => {
		const headers = getRequestHeaders();
		if (!headers) {
			return { session: null };
		}

		const headersToForward = {
			cookie: headers.get("cookie") || "",
			"user-agent": headers.get("user-agent"),
		};

		const { data } = await authClient.getSession({
			fetchOptions: {
				headers: headersToForward,
			},
		});

		return {
			session: data,
		};
	});

export async function isAuthenticated() {
	const user = await authClient.getSession();

	if (user) return true;

	return false;
}
