import type { auth } from "@bimbelbeta/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
	// 1. Browser Environment
	if (typeof window !== "undefined") {
		return import.meta.env.VITE_API_URL || process.env.NODE_ENV === "production"
			? "https://api.bimbelbeta.id"
			: "http://localhost:3001";
	}

	// 2. Server Environment
	return process.env.VITE_API_URL || import.meta.env.VITE_API_URL || process.env.NODE_ENV === "production"
		? "https://api.bimbelbeta.id"
		: "http://localhost:3001";
};

export const authClient = createAuthClient({
	baseURL: getBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
