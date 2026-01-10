import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { adminSubtestRouter } from "./admin/subtest";
import { practicePackRouter } from "./practice-pack";
import { socialRouter } from "./social";
import { subtestRouter } from "./subtest";
import { transactionRouter } from "./transaction";
import { tryoutRouter } from "./tryout";

export const appRouter = {
	healthCheck: pub
		.route({
			path: "/healthcheck",
			method: "GET",
			tags: ["Uncategorized"],
		})
		.output(type({ message: "string" }))
		.handler(() => {
			return { message: "OK" };
		}),
	tryout: tryoutRouter,
	social: socialRouter,
	practicePack: practicePackRouter,
	subtest: subtestRouter,
	admin: {
		practicePack: adminPracticePackRouter,
		subtest: adminSubtestRouter,
	},
	transaction: transactionRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
