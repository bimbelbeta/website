import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question } from "./practice-pack";

/*
  Subtest (Classes)
*/
export const subtest = pgTable("subtest", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	shortName: text("short_name").notNull().unique(),
	description: text(),
	order: integer().notNull().default(1),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/*
  Content Type Enum
*/
export const contentTypeEnum = pgEnum("content_type", ["material", "tips_and_trick"]);

/*
  Content Item ( material | tips_and_trick )
*/
export const contentItem = pgTable(
	"content_item",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		subtestId: integer("subtest_id")
			.notNull()
			.references(() => subtest.id, { onDelete: "cascade" }),
		type: contentTypeEnum("type").notNull(),
		title: text().notNull(),
		order: integer().notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [unique("unique_content_order").on(t.subtestId, t.type, t.order)],
);

/*
  Content Components (Optional, max 1 per content)
*/
export const videoMaterial = pgTable("video_material", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	contentItemId: integer("content_item_id")
		.notNull()
		.unique()
		.references(() => contentItem.id, { onDelete: "cascade" }),
	videoUrl: text("video_url").notNull(), // YouTube URL
	content: jsonb().notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const noteMaterial = pgTable("note_material", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	contentItemId: integer("content_item_id")
		.notNull()
		.unique() // one-to-one
		.references(() => contentItem.id, { onDelete: "cascade" }),
	content: jsonb().notNull(), // Lexical/rich text JSON
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentPracticeQuestions = pgTable(
	"content_practice_questions",
	{
		contentItemId: integer("content_item_id")
			.notNull()
			.references(() => contentItem.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		order: integer().notNull().default(1),
	},
	(t) => [
		// Composite primary key
		{ pk: { columns: [t.contentItemId, t.questionId] } },
		// Ensure unique order per content
		unique("unique_practice_questions_order").on(t.contentItemId, t.order),
	],
);

/*
  User Progress
*/
export const userProgress = pgTable(
	"user_progress",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		contentItemId: integer("content_item_id")
			.notNull()
			.references(() => contentItem.id, { onDelete: "cascade" }),
		videoCompleted: boolean("video_completed").notNull().default(false),
		noteCompleted: boolean("note_completed").notNull().default(false),
		practiceQuestionsCompleted: boolean("practice_questions_completed").notNull().default(false),
		lastViewedAt: timestamp("last_viewed_at").notNull().defaultNow(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		// One progress record per user per content
		unique("unique_user_content").on(t.userId, t.contentItemId),
		// Index for queries
		index("idx_user_progress_user").on(t.userId),
		index("idx_user_progress_content").on(t.contentItemId),
	],
);

/*
  Recent Content Views (Keep last 5 per user)
*/
export const recentContentView = pgTable(
	"recent_content_view",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		contentItemId: integer("content_item_id")
			.notNull()
			.references(() => contentItem.id, { onDelete: "cascade" }),
		viewedAt: timestamp("viewed_at").notNull().defaultNow(),
	},
	(t) => [index("idx_recent_view_user_time").on(t.userId, t.viewedAt)],
);

/*
  Relations
*/
export const subtestRelations = relations(subtest, ({ many }) => ({
	contentItems: many(contentItem),
}));

export const contentItemRelations = relations(contentItem, ({ one, many }) => ({
	subtest: one(subtest, {
		fields: [contentItem.subtestId],
		references: [subtest.id],
	}),
	videoMaterial: one(videoMaterial, {
		fields: [contentItem.id],
		references: [videoMaterial.contentItemId],
	}),
	noteMaterial: one(noteMaterial, {
		fields: [contentItem.id],
		references: [noteMaterial.contentItemId],
	}),
	practiceQuestions: many(contentPracticeQuestions),
	userProgress: many(userProgress),
	recentViews: many(recentContentView),
}));

export const videoMaterialRelations = relations(videoMaterial, ({ one }) => ({
	contentItem: one(contentItem, {
		fields: [videoMaterial.contentItemId],
		references: [contentItem.id],
	}),
}));

export const noteMaterialRelations = relations(noteMaterial, ({ one }) => ({
	contentItem: one(contentItem, {
		fields: [noteMaterial.contentItemId],
		references: [contentItem.id],
	}),
}));

export const contentPracticeQuestionsRelations = relations(contentPracticeQuestions, ({ one }) => ({
	contentItem: one(contentItem, {
		fields: [contentPracticeQuestions.contentItemId],
		references: [contentItem.id],
	}),
	question: one(question, {
		fields: [contentPracticeQuestions.questionId],
		references: [question.id],
	}),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
	user: one(user, {
		fields: [userProgress.userId],
		references: [user.id],
	}),
	contentItem: one(contentItem, {
		fields: [userProgress.contentItemId],
		references: [contentItem.id],
	}),
}));

export const recentContentViewRelations = relations(recentContentView, ({ one }) => ({
	user: one(user, {
		fields: [recentContentView.userId],
		references: [user.id],
	}),
	contentItem: one(contentItem, {
		fields: [recentContentView.contentItemId],
		references: [contentItem.id],
	}),
}));
