import { db } from "@bimbelbeta/db";
import { question, questionAnswerOption } from "@bimbelbeta/db/schema/question";
import { tryout, tryoutAttempt, tryoutQuestions, tryoutUserAnswer } from "@bimbelbeta/db/schema/tryout";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq } from "drizzle-orm";
import { authed } from "..";
import type { Question } from "../types/tryout";

const list = authed
	.route({
		path: "/tryouts",
		method: "GET",
		tags: ["Tryout"],
	})
	.handler(async ({ context }) => {
		const attempts = await db
			.select({
				id: tryout.id,
				attemptId: tryoutAttempt.id,
				title: tryout.title,
				status: tryoutAttempt.status ?? "not_started",
				startedAt: tryoutAttempt.startedAt,
				completedAt: tryoutAttempt.completedAt,
			})
			.from(tryout)
			.leftJoin(
				tryoutAttempt,
				and(eq(tryout.id, tryoutAttempt.tryoutId), eq(tryoutAttempt.userId, context.session.user.id)),
			);

		if (!attempts)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan tryout",
			});

		return attempts;
	});

const find = authed
	.route({
		path: "/tryouts/{id}",
		method: "GET",
		tags: ["Tryout"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input, context }) => {
		// YES 50 INNER JOIN LAGI
		const rows = await db
			.select({
				attemptId: tryoutAttempt.id,
				title: tryout.title,
				status: tryoutAttempt.status,
				startedAt: tryoutAttempt.startedAt,
				completedAt: tryoutAttempt.completedAt,
				questionId: tryoutQuestions.questionId,
				questionOrder: tryoutQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				userSelectedAnswerId: tryoutUserAnswer.selectedAnswerId,
			})
			.from(tryout)
			.innerJoin(tryoutAttempt, eq(tryoutAttempt.tryoutId, tryout.id))
			.innerJoin(tryoutQuestions, eq(tryoutQuestions.tryoutId, tryout.id))
			.innerJoin(question, eq(question.id, tryoutQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				tryoutUserAnswer,
				and(eq(tryoutUserAnswer.questionId, question.id), eq(tryoutUserAnswer.attemptId, tryoutAttempt.id)),
			)
			.where(and(eq(tryout.id, input.id), eq(tryoutAttempt.userId, context.session.user.id)));

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan tryout",
			});

		const pack = {
			attemptId: rows[0].attemptId,
			title: rows[0].title,
			status: rows[0].status,
			startedAt: rows[0].startedAt,
			completedAt: rows[0].completedAt,
			questions: [] as Question[],
		};

		const questionMap = new Map<number, Question>();

		for (const row of rows) {
			if (!questionMap.has(row.questionId))
				questionMap.set(row.questionId, {
					id: row.questionId,
					// set order fallback to 1 or 999 as a default
					order: row.questionOrder ?? 1,
					content: row.questionContent,
					discussion: row.questionDiscussion,
					selectedAnswerId: row.userSelectedAnswerId,
					answers: [],
				});

			questionMap.get(row.questionId)?.answers.push({
				id: row.answerId,
				content: row.answerContent,
			});
		}

		// Format and sort the questions based on order
		pack.questions = Array.from(questionMap.values()).sort((a, b) => a.order - b.order);

		return pack;
	});

const startAttempt = authed
	.route({
		path: "/tryouts/{id}/start",
		method: "POST",
		tags: ["Tryout"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string", attemptId: "number" }))
	.handler(async ({ input, context }) => {
		const [attempt] = await db
			.insert(tryoutAttempt)
			.values({
				tryoutId: input.id,
				userId: context.session.user.id,
			})
			.onConflictDoNothing()
			.returning();

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan tryout",
			});

		return {
			message: "Memulai tryout",
			attemptId: attempt.id,
		};
	});

const saveAnswer = authed
	.route({
		path: "/tryouts/{id}/{questionId}/save",
		method: "POST",
		tags: ["Tryout"],
	})
	.input(
		type({
			id: "number",
			questionId: "number",
			selectedAnswerId: "number",
		}),
	)
	.output(
		type({
			message: "string",
		}),
	)
	.handler(async ({ input, context }) => {
		const [currentAttempt] = await db
			.select({
				id: tryoutAttempt.id,
				userId: tryoutAttempt.userId,
				status: tryoutAttempt.status,
			})
			.from(tryoutAttempt)
			.where(and(eq(tryoutAttempt.tryoutId, input.id), eq(tryoutAttempt.userId, context.session.user.id)))
			.limit(1);

		if (!currentAttempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan tryout",
			});

		if (currentAttempt.userId !== context.session.user.id)
			throw new ORPCError("UNAUTHORIZED", {
				message: "Sesi pengerjaan tryout ini bukan milikmu",
			});

		if (currentAttempt.status !== "ongoing")
			throw new ORPCError("UNPROCESSABLE_CONTENT", {
				message: "Tidak bisa menyimpan jawaban pada tryout yang tidak sedang berlangsung",
			});

		await db
			.insert(tryoutUserAnswer)
			.values({
				attemptId: currentAttempt.id,
				questionId: input.questionId,
				selectedAnswerId: input.selectedAnswerId,
			})
			.onConflictDoUpdate({
				target: [tryoutUserAnswer.attemptId, tryoutUserAnswer.questionId],
				set: { selectedAnswerId: input.selectedAnswerId },
			});

		return { message: "Berhasil menyimpan jawaban!" };
	});

const submitAttempt = authed
	.route({
		path: "/tryouts/{id}/submit",
		method: "POST",
		tags: ["Tryout"],
	})
	.input(
		type({
			id: "number",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ context, input }) => {
		const [attempt] = await db
			.update(tryoutAttempt)
			.set({
				completedAt: new Date(),
				status: "finished",
			})
			.where(and(eq(tryoutAttempt.tryoutId, input.id), eq(tryoutAttempt.userId, context.session.user.id)))
			.returning();

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi tryout",
			});

		return {
			message: "Berhasil mengumpul tryout",
		};
	});

const history = authed
	.route({
		path: "/tryouts/history",
		method: "GET",
		tags: ["Tryout"],
	})
	.handler(async ({ context }) => {
		const attempts = await db
			.select({
				tryoutId: tryoutAttempt.tryoutId,
				startedAt: tryoutAttempt.startedAt,
				completedAt: tryoutAttempt.completedAt,
				status: tryoutAttempt.status,
			})
			.from(tryoutAttempt)
			.where(eq(tryoutAttempt.userId, context.session.user.id))
			.orderBy(desc(tryoutAttempt.startedAt));

		return {
			tryoutsFinished: attempts.filter((pack) => pack.status === "finished").length,
			data: attempts,
		};
	});

const historyByTryout = authed
	.route({
		path: "/tryouts/{id}/history",
		method: "GET",
		tags: ["Tryout"],
	})
	.input(
		type({
			id: "number",
		}),
	)
	.handler(async ({ input, context }) => {
		// same query as .find()
		const rows = await db
			.select({
				attemptId: tryoutAttempt.id,
				title: tryout.title,
				questionId: tryoutQuestions.questionId,
				questionOrder: tryoutQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerIsCorrect: questionAnswerOption.isCorrect,
				userSelectedAnswerId: tryoutUserAnswer.selectedAnswerId,
				startedAt: tryoutAttempt.startedAt,
				completedAt: tryoutAttempt.completedAt,
			})
			.from(tryout)
			.innerJoin(tryoutAttempt, eq(tryoutAttempt.tryoutId, tryout.id))
			.innerJoin(tryoutQuestions, eq(tryoutQuestions.tryoutId, tryout.id))
			.innerJoin(question, eq(question.id, tryoutQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				tryoutUserAnswer,
				and(eq(tryoutUserAnswer.questionId, question.id), eq(tryoutUserAnswer.attemptId, tryoutAttempt.id)),
			)
			.where(
				and(
					eq(tryout.id, input.id),
					eq(tryoutAttempt.userId, context.session.user.id),
					eq(tryoutAttempt.status, "finished"),
				),
			);

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan tryout",
			});

		const pack = {
			attemptId: rows[0].attemptId,
			title: rows[0].title,
			startedAt: rows[0].startedAt,
			completedAt: rows[0].completedAt,
			questions: [] as (Question & { userAnswerIsCorrect: boolean })[],
		};

		const questionMap = new Map<number, Question & { userAnswerIsCorrect: boolean }>();

		for (const row of rows) {
			if (!questionMap.has(row.questionId)) {
				const userAnswerIsCorrect =
					row.userSelectedAnswerId !== null &&
					row.answerIsCorrect === true &&
					row.userSelectedAnswerId === row.answerId;

				questionMap.set(row.questionId, {
					id: row.questionId,
					// set order fallback to 1 or 999 as a default
					order: row.questionOrder ?? 1,
					content: row.questionContent,
					discussion: row.questionDiscussion,
					selectedAnswerId: row.userSelectedAnswerId,
					userAnswerIsCorrect,
					answers: [],
				});
			}

			questionMap.get(row.questionId)?.answers.push({
				id: row.answerId,
				content: row.answerContent,
				isCorrect: row.answerIsCorrect ?? undefined,
			});

			// Update userAnswerIsCorrect if this row shows the user selected the correct answer
			const question = questionMap.get(row.questionId);
			if (question && row.userSelectedAnswerId === row.answerId && row.answerIsCorrect === true) {
				question.userAnswerIsCorrect = true;
			}
		}

		// Format and sort the questions based on order
		pack.questions = Array.from(questionMap.values()).sort((a, b) => a.order - b.order);

		return pack;
	});

export const tryoutRouter = {
	list,
	find,
	startAttempt,
	submitAttempt,
	saveAnswer,
	history,
	historyByTryout,
};
