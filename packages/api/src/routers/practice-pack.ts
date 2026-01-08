import { db } from "@bimbelbeta/db";
import {
	practicePack,
	practicePackAttempt,
	practicePackQuestions,
	practicePackUserAnswer,
	question,
	questionAnswerOption,
} from "@bimbelbeta/db/schema/practice-pack";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq } from "drizzle-orm";
import { authed } from "../index";
import type { Question } from "../types/practice-pack";

const list = authed
	.route({
		path: "/practice-packs",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.handler(async ({ context }) => {
		const attempts = await db
			.select({
				id: practicePack.id,
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				status: practicePackAttempt.status ?? "not_started",
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
			})
			.from(practicePack)
			.leftJoin(
				practicePackAttempt,
				and(
					eq(practicePack.id, practicePackAttempt.practicePackId),
					eq(practicePackAttempt.userId, context.session.user.id),
				),
			);

		if (!attempts)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
			});

		return attempts;
	});

const find = authed
	.route({
		path: "/practice-packs/{id}",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input, context }) => {
		// YES 50 INNER JOIN LAGI
		const rows = await db
			.select({
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				status: practicePackAttempt.status,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
			})
			.from(practicePack)
			.innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				practicePackUserAnswer,
				and(
					eq(practicePackUserAnswer.questionId, question.id),
					eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
				),
			)
			.where(and(eq(practicePack.id, input.id), eq(practicePackAttempt.userId, context.session.user.id)));

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
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
		path: "/practice-packs/{id}/start",
		method: "POST",
		tags: ["Practice Packs"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string", attemptId: "number" }))
	.handler(async ({ input, context }) => {
		const [attempt] = await db
			.insert(practicePackAttempt)
			.values({
				practicePackId: input.id,
				userId: context.session.user.id,
			})
			.onConflictDoNothing()
			.returning();

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan latihan soal",
			});

		return {
			message: "Memulai latihan soal",
			attemptId: attempt.id,
		};
	});

const saveAnswer = authed
	.route({
		path: "/practice-packs/{id}/{questionId}/save",
		method: "POST",
		tags: ["Practice Packs"],
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
				id: practicePackAttempt.id,
				userId: practicePackAttempt.userId,
				status: practicePackAttempt.status,
			})
			.from(practicePackAttempt)
			.where(
				and(eq(practicePackAttempt.practicePackId, input.id), eq(practicePackAttempt.userId, context.session.user.id)),
			)
			.limit(1);

		if (!currentAttempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan latihan soal",
			});

		if (currentAttempt.userId !== context.session.user.id)
			throw new ORPCError("UNAUTHORIZED", {
				message: "Sesi pengerjaan latihan soal ini bukan milikmu",
			});

		if (currentAttempt.status !== "ongoing")
			throw new ORPCError("UNPROCESSABLE_CONTENT", {
				message: "Tidak bisa menyimpan jawaban pada latihan soal yang tidak sedang berlangsung",
			});

		await db
			.insert(practicePackUserAnswer)
			.values({
				attemptId: currentAttempt.id,
				questionId: input.questionId,
				selectedAnswerId: input.selectedAnswerId,
			})
			.onConflictDoUpdate({
				target: [practicePackUserAnswer.attemptId, practicePackUserAnswer.questionId],
				set: { selectedAnswerId: input.selectedAnswerId },
			});

		return { message: "Berhasil menyimpan jawaban!" };
	});

const submitAttempt = authed
	.route({
		path: "/practice-packs/{id}/submit",
		method: "POST",
		tags: ["Practice Packs"],
	})
	.input(
		type({
			id: "number",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ context, input }) => {
		const [attempt] = await db
			.update(practicePackAttempt)
			.set({
				completedAt: new Date(),
				status: "finished",
			})
			.where(
				and(eq(practicePackAttempt.practicePackId, input.id), eq(practicePackAttempt.userId, context.session.user.id)),
			)
			.returning();

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi latihan soal",
			});

		return {
			message: "Berhasil mengumpul latihan soal",
		};
	});

const history = authed
	.route({
		path: "/practice-packs/history",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.handler(async ({ context }) => {
		const attempts = await db
			.select({
				practicePackId: practicePackAttempt.practicePackId,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
				status: practicePackAttempt.status,
			})
			.from(practicePackAttempt)
			.where(eq(practicePackAttempt.userId, context.session.user.id))
			.orderBy(desc(practicePackAttempt.startedAt));

		return {
			packsFinished: attempts.filter((pack) => pack.status === "finished").length,
			data: attempts,
		};
	});

const historyByPack = authed
	.route({
		path: "/practice-packs/{id}/history",
		method: "GET",
		tags: ["Practice Packs"],
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
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerIsCorrect: questionAnswerOption.isCorrect,
				userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
			})
			.from(practicePack)
			.innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				practicePackUserAnswer,
				and(
					eq(practicePackUserAnswer.questionId, question.id),
					eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
				),
			)
			.where(
				and(
					eq(practicePack.id, input.id),
					eq(practicePackAttempt.userId, context.session.user.id),
					eq(practicePackAttempt.status, "finished"),
				),
			);

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
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

export const practicePackRouter = {
	list,
	find,
	startAttempt,
	submitAttempt,
	saveAnswer,
	history,
	historyByPack,
};
