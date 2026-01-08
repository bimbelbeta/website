import { decimal, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Maybe we'll have products to sell int he future, but for now just we'll adjust to only accomodating premium
export const typeEnum = pgEnum("transaction_type_enum", ["premium", "product"]);
export const statusEnum = pgEnum("transaction_status_enum", ["pending", "success", "failed"]);
export const transaction = pgTable("transaction", {
	id: uuid().defaultRandom().primaryKey(),
	userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
	grossAmount: decimal("gross_amount"),
	transactionType: typeEnum("transaction_type").notNull(),
	status: statusEnum("status").notNull().default("pending"),
	// productId: integer("product_id").references(() => product.id),
	paidAt: timestamp("paid_at"),
	orderedAt: timestamp("ordered_at").defaultNow(),
});
