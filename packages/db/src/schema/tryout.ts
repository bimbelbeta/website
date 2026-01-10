import { relations } from "drizzle-orm";
import { boolean, char, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question, questionAnswerOption } from "./question";

export const tryout = pgTable("tryout", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: text().notNull(),
	description: text(),
});

export const tryoutRelation = relations(tryout, ({ many }) => ({
	questions: many(tryoutQuestions),
}));

export const tryoutStatus = pgEnum("tryout_status", ["not_started", "ongoing", "finished"]);

export const tryoutAttempt = pgTable(
	"tryout_attempt",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "set null" }),
		tryoutId: integer("tryout_id")
			.notNull()
			.references(() => tryout.id, { onDelete: "cascade" }),
		startedAt: timestamp("started_at").notNull().defaultNow(),
		completedAt: timestamp("completed_at"),
		status: tryoutStatus("tryout_status").notNull().default("ongoing"),
	},
	(t) => [unique("user_attempt").on(t.userId, t.tryoutId)],
);

export const tryoutQuestions = pgTable(
	"tryout_questions",
	{
		tryoutId: integer("tryout_id")
			.notNull()
			.references(() => tryout.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		order: integer("order").default(1),
	},
	(table) => [primaryKey({ columns: [table.tryoutId, table.questionId] })],
);

export const tryoutQuestionsRelations = relations(tryoutQuestions, ({ one }) => ({
	tryout: one(tryout, {
		fields: [tryoutQuestions.tryoutId],
		references: [tryout.id],
	}),
	question: one(question, {
		fields: [tryoutQuestions.questionId],
		references: [question.id],
	}),
}));

// we can save the user's responses with the table below
export const tryoutUserAnswer = pgTable(
	"tryout_user_answer",
	{
		attemptId: integer("attempt_id")
			.notNull()
			.references(() => tryout.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		selectedAnswerId: integer("selected_answer_id")
			.notNull()
			.references(() => questionAnswerOption.id, { onDelete: "set null" }),
	},
	(t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);
