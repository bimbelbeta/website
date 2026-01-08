import { createHash } from "node:crypto";
import { db } from "@bimbelbeta/db";
import { user } from "@bimbelbeta/db/schema/auth";
import { transaction } from "@bimbelbeta/db/schema/transaction";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { Snap } from "midtrans-client";
import { authed, pub } from "..";

const PREMIUM_PRICE = 100_000;

const snap = new Snap({
	isProduction: process.env.NODE_ENV === "production",
	serverKey: process.env.MIDTRANS_SERVER_KEY || "",
	clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const premium = authed
	.route({
		path: "/transactions/premium",
		method: "POST",
		tags: ["Payment", "Premium"],
	})
	.output(
		type({
			token: "string",
			redirectUrl: "string",
		}),
	)
	.handler(async ({ context, errors }) => {
		if (context.session.user.isPremium)
			throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });

		const grossAmount = PREMIUM_PRICE;
		const [createdTransaction] = await db
			.insert(transaction)
			.values({
				grossAmount: String(grossAmount),
				userId: context.session.user.id,
				transactionType: "premium",
			})
			.returning();

		const params = {
			transaction_details: {
				order_id: String(createdTransaction?.id),
				gross_amount: grossAmount,
			},
			item_details: [
				{
					price: PREMIUM_PRICE,
					quantity: 1,
					name: "Premium Access",
				},
			],
			customer_details: {
				first_name: context.session.user.name,
				email: context.session.user.email,
			},
			credit_card: { secure: true },
			callbacks: {
				finish: `${process.env.CORS_ORIGIN}/premium/payment/finish`,
				error: `${process.env.CORS_ORIGIN}/premium/payment/error`,
				pending: `${process.env.CORS_ORIGIN}/premium/payment/unfinish`,
			},
		};

		const snapTransaction = await snap.createTransaction(params);

		return {
			token: snapTransaction.token,
			redirectUrl: snapTransaction.redirect_url,
		};
	});

const notification = pub
	.route({
		path: "/transactions/notification",
		method: "POST",
		tags: ["Payment", "Webhook"],
	})
	.input(type({} as Record<string, unknown>))
	.handler(async ({ input }) => {
		const { signature_key, order_id, status_code, gross_amount } = input as {
			signature_key: string;
			order_id: string;
			status_code: string;
			gross_amount: string;
		};

		const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
		const expectedSignature = createHash("sha512")
			.update(order_id + status_code + gross_amount + serverKey)
			.digest("hex");

		if (signature_key !== expectedSignature) {
			console.error("Invalid webhook signature");
			throw new ORPCError("UNAUTHORIZED", {
				message: "Invalid signature",
			});
		}

		const statusResponse = await snap.transaction.notification(input);
		const orderId = statusResponse.order_id;
		const transactionStatus = statusResponse.transaction_status;
		const fraudStatus = statusResponse.fraud_status;

		console.log(
			`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`,
		);

		const [existingTransaction] = await db.select().from(transaction).where(eq(transaction.id, orderId)).limit(1);

		if (!existingTransaction) {
			console.error(`Transaction not found for order ID: ${orderId}`);
			return { status: "not_found" };
		}

		const tx = existingTransaction;

		if (tx.paidAt) {
			console.log(`Transaction ${orderId} already processed`);
			return { status: "already_processed" };
		}

		if (transactionStatus === "capture") {
			if (fraudStatus === "accept") {
				await db.transaction(async (trx) => {
					await trx
						.update(transaction)
						.set({
							status: "success",
							paidAt: new Date(),
						})
						.where(eq(transaction.id, orderId));

					await trx.update(user).set({ isPremium: true }).where(eq(user.id, tx.userId!));
				});
			}
		} else if (transactionStatus === "settlement") {
			await db.transaction(async (trx) => {
				await trx
					.update(transaction)
					.set({
						status: "success",
						paidAt: new Date(),
					})
					.where(eq(transaction.id, orderId));

				const expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + 30);

				await trx.update(user).set({ isPremium: true, premiumExpiresAt: expireDate }).where(eq(user.id, tx.userId!));
			});
		} else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
			await db
				.update(transaction)
				.set({
					status: "failed",
				})
				.where(eq(transaction.id, orderId));
		} else if (transactionStatus === "pending") {
			await db
				.update(transaction)
				.set({
					status: "pending",
				})
				.where(eq(transaction.id, orderId));
		}

		return { status: "ok" };
	});

const getStatus = authed
	.route({
		path: "/transactions/status",
		method: "GET",
		tags: ["Payment"],
	})
	.input(type({ orderId: "string" }))
	.handler(async ({ input }) => {
		const tx = await db.select().from(transaction).where(eq(transaction.id, input.orderId)).limit(1);

		if (!tx.length) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transaction not found",
			});
		}

		const row = tx[0]!;
		return {
			status: row.status,
			paidAt: row.paidAt,
		};
	});

export const transactionRouter = {
	premium,
	notification,
	getStatus,
};
