import { relations } from "drizzle-orm";
import { boolean, char, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { practicePackQuestions } from "./practice-pack";
import { tryoutQuestions } from "./tryout";

export const question = pgTable("question", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	content: text("content").notNull(),
	discussion: text("discussion").notNull(),
});

export const questionRelations = relations(question, ({ many }) => ({
	answerOptions: many(questionAnswerOption),
	practicePacks: many(practicePackQuestions),
	tryouts: many(tryoutQuestions),
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
