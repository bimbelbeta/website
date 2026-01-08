import { type } from "arktype";
import { authed } from "..";

export const socialRouter = authed
	.route({
		path: "/socials",
		method: "GET",
		tags: ["Socials", "Premium"],
	})
	.output(
		type({
			whatsapp: "string",
			discord: "string",
		}).or({
			whatsapp: "null",
			discord: "null",
		}),
	)
	.handler(({ context }) => {
		if (!context.session.user.isPremium)
			return {
				whatsapp: null,
				discord: null,
			};

		return {
			whatsapp: process.env.WHATSAPP_LINK as string,
			discord: process.env.DISCORD_LINK as string,
		};
	});
