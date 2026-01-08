import { createContext } from "@bimbelbeta/api/context";
import { appRouter } from "@bimbelbeta/api/routers/index";
import { auth } from "@bimbelbeta/auth";
import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: [
			process.env.CORS_ORIGIN || "http://localhost:3000",
			"http://localhost:3000",
			"https://bimbelbeta.id",
			"https://api.bimbelbeta.id",
		],
		allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ArkTypeToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

app.use("/*", async (c, next) => {
	const context = await createContext({ context: c });

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "/api-reference",
		context: context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
});

app.post("/transactions/webhook", async (c) => {
	await c.req.json();

	return c.json({ status: "OK" });
});

app.get("/", (c) => {
	return c.text("OK");
});

export default {
	port: process.env.PORT || 3001,
	fetch: (req: Request) => {
		const url = new URL(req.url);
		if (req.headers.get("x-forwarded-proto") === "https") {
			url.protocol = "https:";
		}
		return app.fetch(new Request(url, req));
	},
};
