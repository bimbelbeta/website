import { db } from "@bimbelbeta/db";
import * as schema from "@bimbelbeta/db/schema/auth";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { generateResetPasswordEmail } from "./lib/templates/reset-password";

export const resend = new Resend(process.env.RESEND_API_KEY || "");

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				validator: {
					input: type('"user" | "admin"'),
				},
				defaultValue: "user",
				input: false,
			},
			isPremium: {
				type: "boolean",
				validator: {
					input: type("boolean"),
				},
				defaultValue: false,
				input: false,
			},
			flashcardStreak: {
				type: "number",
				validator: {
					input: type("number"),
				},
				defaultValue: 0,
				input: false,
			},
			lastCompletedFlashcardAt: {
				type: "date",
				validator: {
					input: type("Date"),
				},
				defaultValue: null,
				input: false,
			},
			premiumExpiresAt: {
				type: "date",
				validator: {
					input: type("Date"),
				},
				required: false,
				defaultValue: null,
				input: false,
			},
		},
	},
	trustedOrigins: [
		process.env.CORS_ORIGIN || "http://localhost:3000",
		"https://bimbelbeta.id",
		"https://www.bimbelbeta.id",
		"https://api.bimbelbeta.id",
	],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }) => {
			resend.emails
				.send({
					from: "bimbelbeta <noreply@bimbelbeta.id>",
					to: user.email,
					subject: "Pesan Otomatis: Permintaan Pengaturan Ulang Kata Sandi",
					html: generateResetPasswordEmail(user.name, url, token),
				})
				.catch((error) => {
					console.error("Failed to send password reset email:", error);
				});
		},
	},
	socialProviders: {
		google: {
			clientId: (process.env.GOOGLE_CLIENT_ID as string)?.trim(),
			clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string)?.trim(),
			accessType: "offline",
			prompt: "select_account consent",
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "Lax",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		},
		...(process.env.NODE_ENV === "production" && {
			crossSubDomainCookies: {
				enabled: true,
				domain: ".bimbelbeta.id",
			},
		}),
	},
});
