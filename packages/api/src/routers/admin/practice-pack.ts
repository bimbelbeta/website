import { db } from "@bimbelbeta/db";
import { user } from "@bimbelbeta/db/schema/auth";
import {
	practicePack,
	practicePackQuestions,
	question,
	questionAnswerOption,
} from "@bimbelbeta/db/schema/practice-pack";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, count, eq, ilike, sql } from "drizzle-orm";
import { admin } from "../../index";

const getStatistics = admin
	.route({
		path: "/admin/statistics",
		method: "GET",
		tags: ["Admin - Statistics"],
	})
	.handler(async () => {
		const [totalUsers] = await db.select({ count: count() }).from(user);
		const [totalPacks] = await db.select({ count: count() }).from(practicePack);
		const [totalQuestions] = await db.select({ count: count() }).from(question);

		return {
			totalUsers: totalUsers?.count || 0,
			totalPracticePacks: totalPacks?.count || 0,
			totalQuestions: totalQuestions?.count || 0,
		};
	});

const listPacks = admin
	.route({
		path: "/admin/practice-packs",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
		}),
	)
	.handler(async ({ input }) => {
		const limit = input.limit || 20;
		const offset = input.offset || 0;

		const [totalCount] = await db.select({ count: count() }).from(practicePack);

		const packs = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack)
			.limit(limit)
			.offset(offset)
			.orderBy(practicePack.id);

		return {
			data: packs,
			total: totalCount?.count || 0,
			limit,
			offset,
		};
	});

const getPack = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [pack] = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack)
			.where(eq(practicePack.id, input.id))
			.limit(1);

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return pack;
	});

const createPack = admin
	.route({
		path: "/admin/practice-packs",
		method: "POST",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			title: "string",
			"description?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db
			.insert(practicePack)
			.values({
				...input,
			})
			.returning();

		if (!pack)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat practice pack",
			});

		return pack;
	});

const updatePack = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "PUT",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			id: "number",
			title: "string",
			"description?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db
			.update(practicePack)
			.set({
				title: input.title,
				description: input.description,
			})
			.where(eq(practicePack.id, input.id))
			.returning();

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return pack;
	});

const deletePack = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "DELETE",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [pack] = await db.delete(practicePack).where(eq(practicePack.id, input.id)).returning();

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return { message: "Berhasil menghapus practice pack" };
	});

// QUESTION CRUD

const listAllQuestions = admin
	.route({
		path: "/admin/questions",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
			"unusedOnly?": "boolean",
			"search?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const limit = input.limit || 20;
		const offset = input.offset || 0;
		const unusedOnly = input.unusedOnly || false;
		const search = input.search || "";

		// Build base SELECT for data query
		const selectFields = {
			id: question.id,
			content: question.content,
			discussion: question.discussion,
			packCount: sql<number>`cast(count(${practicePackQuestions.practicePackId}) as integer)`,
		};

		// Build data query with conditional WHERE clause
		const dataQueryBuilder = search
			? db
					.select(selectFields)
					.from(question)
					.where(ilike(question.content, `%${search}%`))
					.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
					.groupBy(question.id)
			: db
					.select(selectFields)
					.from(question)
					.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
					.groupBy(question.id);

		// Apply HAVING filter and pagination
		const dataQuery = unusedOnly
			? dataQueryBuilder
					.having(sql`count(${practicePackQuestions.practicePackId}) = 0`)
					.orderBy(question.id)
					.limit(limit)
					.offset(offset)
			: dataQueryBuilder.orderBy(question.id).limit(limit).offset(offset);

		// Build count query with same filters
		const baseCountQuery = search
			? db
					.select({ id: question.id })
					.from(question)
					.where(ilike(question.content, `%${search}%`))
			: db.select({ id: question.id }).from(question);

		const countQuery = unusedOnly
			? db.select({ count: sql<number>`cast(count(*) as integer)` }).from(
					(search
						? db
								.select({ id: question.id })
								.from(question)
								.where(ilike(question.content, `%${search}%`))
								.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
								.groupBy(question.id)
								.having(sql`count(${practicePackQuestions.practicePackId}) = 0`)
						: db
								.select({ id: question.id })
								.from(question)
								.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
								.groupBy(question.id)
								.having(sql`count(${practicePackQuestions.practicePackId}) = 0`)
					).as("sq"),
				)
			: db.select({ count: sql<number>`cast(count(*) as integer)` }).from(baseCountQuery.as("sq"));

		const [data, [countResult]] = await Promise.all([dataQuery, countQuery]);

		const total = countResult?.count || 0;

		return {
			data,
			total,
			limit,
			offset,
		};
	});

const getQuestionDetail = admin
	.route({
		path: "/admin/questions/{id}",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const q = await db.query.question.findFirst({
			where: eq(question.id, input.id),
			with: {
				answerOptions: {
					orderBy: (answerOptions, { asc }) => [asc(answerOptions.code)],
				},
			},
		});

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return {
			...q,
			answers: q.answerOptions,
		};
	});

const createQuestion = admin
	.route({
		path: "/admin/questions",
		method: "POST",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			content: "string",
			discussion: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db
			.insert(question)
			.values({
				content: input.content,
				discussion: input.discussion,
			})
			.returning();

		if (!q)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat question",
			});

		return q;
	});

const updateQuestion = admin
	.route({
		path: "/admin/questions/{id}",
		method: "PUT",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			id: "number",
			content: "string",
			discussion: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db
			.update(question)
			.set({
				content: input.content,
				discussion: input.discussion,
			})
			.where(eq(question.id, input.id))
			.returning();

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return q;
	});

const deleteQuestion = admin
	.route({
		path: "/admin/questions/{id}",
		method: "DELETE",
		tags: ["Admin - Questions"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [q] = await db.delete(question).where(eq(question.id, input.id)).returning();

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return { message: "Berhasil menghapus question" };
	});

// QUESTION - PRACTICE PACK RELATION

const addQuestionToPack = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions",
		method: "POST",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
			order: "number",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db.select().from(practicePack).where(eq(practicePack.id, input.practicePackId)).limit(1);

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		const [q] = await db.select().from(question).where(eq(question.id, input.questionId)).limit(1);

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		await db
			.insert(practicePackQuestions)
			.values({
				practicePackId: input.practicePackId,
				questionId: input.questionId,
				order: input.order,
			})
			.onConflictDoNothing();

		return { message: "Berhasil menambahkan question ke practice pack" };
	});

const removeQuestionFromPack = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions/{questionId}",
		method: "DELETE",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
		}),
	)
	.handler(async ({ input }) => {
		await db
			.delete(practicePackQuestions)
			.where(
				and(
					eq(practicePackQuestions.practicePackId, input.practicePackId),
					eq(practicePackQuestions.questionId, input.questionId),
				),
			);

		return { message: "Berhasil menghapus question dari practice pack" };
	});

const updateQuestionOrder = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions/{questionId}",
		method: "PATCH",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
			order: "number",
		}),
	)
	.handler(async ({ input }) => {
		await db
			.update(practicePackQuestions)
			.set({ order: input.order })
			.where(
				and(
					eq(practicePackQuestions.practicePackId, input.practicePackId),
					eq(practicePackQuestions.questionId, input.questionId),
				),
			);

		return { message: "Berhasil mengupdate urutan question" };
	});

// ANSWER OPTION CRUD

const createAnswerOption = admin
	.route({
		path: "/admin/questions/{questionId}/answers",
		method: "POST",
		tags: ["Admin - Answer Options"],
	})
	.input(
		type({
			questionId: "number",
			content: "string",
			isCorrect: "boolean",
			code: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db.select().from(question).where(eq(question.id, input.questionId)).limit(1);

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		const [answer] = await db
			.insert(questionAnswerOption)
			.values({
				questionId: input.questionId,
				content: input.content,
				isCorrect: input.isCorrect,
				code: input.code,
			})
			.returning();

		if (!answer)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat answer option",
			});

		return answer;
	});

const updateAnswerOption = admin
	.route({
		path: "/admin/answers/{id}",
		method: "PUT",
		tags: ["Admin - Answer Options"],
	})
	.input(
		type({
			id: "number",
			content: "string",
			isCorrect: "boolean",
		}),
	)
	.handler(async ({ input }) => {
		const [answer] = await db
			.update(questionAnswerOption)
			.set({
				content: input.content,
				isCorrect: input.isCorrect,
			})
			.where(eq(questionAnswerOption.id, input.id))
			.returning();

		if (!answer)
			throw new ORPCError("NOT_FOUND", {
				message: "Answer option tidak ditemukan",
			});

		return answer;
	});

const deleteAnswerOption = admin
	.route({
		path: "/admin/answers/{id}",
		method: "DELETE",
		tags: ["Admin - Answer Options"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [answer] = await db.delete(questionAnswerOption).where(eq(questionAnswerOption.id, input.id)).returning();

		if (!answer)
			throw new ORPCError("NOT_FOUND", {
				message: "Answer option tidak ditemukan",
			});

		return { message: "Berhasil menghapus answer option" };
	});

/**
 * Get all questions in a practice pack (for admin use, no attempt required)
 * GET /api/admin/practice-packs/{id}/questions
 */
const getPackQuestions = admin
	.route({
		path: "/admin/practice-packs/{id}/questions",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const rows = await db
			.select({
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerCode: questionAnswerOption.code,
				answerIsCorrect: questionAnswerOption.isCorrect,
			})
			.from(practicePack)
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.where(eq(practicePack.id, input.id));

		if (rows.length === 0) {
			// Check if pack exists
			const [pack] = await db.select().from(practicePack).where(eq(practicePack.id, input.id)).limit(1);
			if (!pack) {
				throw new ORPCError("NOT_FOUND", {
					message: "Practice pack not found",
				});
			}
			return { questions: [] };
		}

		const questionMap = new Map<
			number,
			{
				id: number;
				order: number;
				content: string;
				discussion: string;
				answers: Array<{ id: number; content: string; code: string; isCorrect: boolean }>;
			}
		>();

		for (const row of rows) {
			if (!questionMap.has(row.questionId)) {
				questionMap.set(row.questionId, {
					id: row.questionId,
					order: row.questionOrder ?? 1,
					content: row.questionContent,
					discussion: row.questionDiscussion,
					answers: [],
				});
			}

			questionMap.get(row.questionId)?.answers.push({
				id: row.answerId,
				content: row.answerContent,
				code: row.answerCode,
				isCorrect: row.answerIsCorrect ?? false,
			});
		}

		// Format and sort the questions based on order
		const questions = Array.from(questionMap.values())
			.map((q) => ({
				...q,
				answers: q.answers.sort((a, b) => a.code.localeCompare(b.code)),
			}))
			.sort((a, b) => a.order - b.order);

		return { questions };
	});

// EXPORT

export const adminPracticePackRouter = {
	// Statistics
	getStatistics,

	// Practice Pack
	listPacks,
	getPack,
	createPack,
	updatePack,
	deletePack,

	// Question
	listAllQuestions,
	getQuestionDetail,
	createQuestion,
	updateQuestion,
	deleteQuestion,

	// Question - Pack Relation
	addQuestionToPack,
	removeQuestionFromPack,
	updateQuestionOrder,

	// Answer Options
	createAnswerOption,
	updateAnswerOption,
	deleteAnswerOption,

	// Get Pack Questions
	getPackQuestions,
};
