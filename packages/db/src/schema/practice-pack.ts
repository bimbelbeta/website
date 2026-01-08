import { relations } from "drizzle-orm";
import { boolean, char, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

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

export const question = pgTable("question", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	content: text("content").notNull(),
	discussion: text("discussion").notNull(),
});

export const questionRelations = relations(question, ({ many }) => ({
	answerOptions: many(questionAnswerOption),
	practicePacks: many(practicePackQuestions),
}));

export const questionAnswerOption = pgTable(
	"question_answer_option",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		code: char({ length: 1 }).notNull(),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		content: text().notNull(),
		isCorrect: boolean("is_correct").notNull().default(false),
	},
	(t) => [unique("question_answer_option_question_id_code_unique").on(t.questionId, t.code)],
);

export const questionAnswerOptionRelations = relations(questionAnswerOption, ({ one }) => ({
	question: one(question, {
		fields: [questionAnswerOption.questionId],
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
