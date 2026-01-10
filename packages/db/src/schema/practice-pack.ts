import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question, questionAnswerOption } from "./question";

export const practicePack = pgTable("practice_pack", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: text().notNull(),
	description: text(),
});

export const practicePackRelations = relations(practicePack, ({ many }) => ({
	questions: many(practicePackQuestions),
}));

export const practicePackStatus = pgEnum("practice_pack_status", ["not_started", "ongoing", "finished"]);

export const practicePackAttempt = pgTable(
	"practice_pack_attempt",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "set null" }),
		practicePackId: integer("practice_pack_id")
			.notNull()
			.references(() => practicePack.id, { onDelete: "cascade" }),
		startedAt: timestamp("started_at").notNull().defaultNow(),
		completedAt: timestamp("completed_at"),
		status: practicePackStatus("practice_pack_status").notNull().default("ongoing"),
	},
	(t) => [unique("user_attempt").on(t.userId, t.practicePackId)],
);

export const practicePackQuestions = pgTable(
	"practice_pack_questions",
	{
		practicePackId: integer("practice_pack_id")
			.notNull()
			.references(() => practicePack.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		order: integer("order").default(1),
	},
	(table) => [primaryKey({ columns: [table.practicePackId, table.questionId] })],
);

export const practicePackQuestionsRelations = relations(practicePackQuestions, ({ one }) => ({
	practicePack: one(practicePack, {
		fields: [practicePackQuestions.practicePackId],
		references: [practicePack.id],
	}),
	question: one(question, {
		fields: [practicePackQuestions.questionId],
		references: [question.id],
	}),
}));

// we can save the user's responses with the table below
export const practicePackUserAnswer = pgTable(
	"practice_pack_user_answer",
	{
		attemptId: integer("attempt_id")
			.notNull()
			.references(() => practicePackAttempt.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		selectedAnswerId: integer("selected_answer_id")
			.notNull()
			.references(() => questionAnswerOption.id, { onDelete: "set null" }),
	},
	(t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);
