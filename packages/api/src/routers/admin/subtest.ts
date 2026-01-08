import { db } from "@bimbelbeta/db";
import {
	contentItem,
	contentPracticeQuestions,
	noteMaterial,
	subtest,
	videoMaterial,
} from "@bimbelbeta/db/schema/subtest";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { admin } from "../..";

/**
 * Create new subtest (class)
 * POST /api/admin/subtests
 */
const createSubtest = admin
	.route({
		path: "/admin/subtests",
		method: "POST",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			name: "string",
			shortName: "string",
			description: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string", id: "number" }))
	.handler(async ({ input }) => {
		const [created] = await db
			.insert(subtest)
			.values({
				name: input.name,
				shortName: input.shortName,
				description: input.description ?? null,
				order: input.order ?? 1,
			})
			.returning();

		if (!created)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat kelas",
			});

		return {
			message: "Kelas berhasil dibuat",
			id: created.id,
		};
	});

/**
 * Update subtest (class)
 * PATCH /api/admin/subtests/{id}
 */
const updateSubtest = admin
	.route({
		path: "/admin/subtests/{id}",
		method: "PATCH",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			id: "number",
			name: "string?",
			shortName: "string?",
			description: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const updateData: {
			name?: string;
			shortName?: string;
			description?: string | null;
			order?: number;
			updatedAt: Date;
		} = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.shortName !== undefined) updateData.shortName = input.shortName;
		if (input.description !== undefined) updateData.description = input.description ?? null;
		if (input.order !== undefined) updateData.order = input.order;

		const [updatedRow] = await db.update(subtest).set(updateData).where(eq(subtest.id, input.id)).returning();

		if (!updatedRow)
			throw new ORPCError("NOT_FOUND", {
				message: "Kelas tidak ditemukan",
			});

		return { message: "Kelas berhasil diperbarui" };
	});

/**
 * Delete subtest (class)
 * DELETE /api/admin/subtests/{id}
 */
const deleteSubtest = admin
	.route({
		path: "/admin/subtests/{id}",
		method: "DELETE",
		tags: ["Admin - Classes"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const [deletedRow] = await db.delete(subtest).where(eq(subtest.id, input.id)).returning();

		if (!deletedRow)
			throw new ORPCError("NOT_FOUND", {
				message: "Kelas tidak ditemukan",
			});

		return { message: "Kelas berhasil dihapus" };
	});

/**
 * Reorder subtests (classes)
 * PATCH /api/admin/subtests/reorder
 */
const reorderSubtests = admin
	.route({
		path: "/admin/subtests/reorder",
		method: "PATCH",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			items: "unknown",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const items = input.items as { id: number; order: number }[];

		await db.transaction(async (tx) => {
			for (const item of items) {
				await tx.update(subtest).set({ order: item.order, updatedAt: new Date() }).where(eq(subtest.id, item.id));
			}
		});

		return { message: "Urutan kelas berhasil diperbarui" };
	});

/**
 * Create new content item
 * POST /api/admin/content
 */
const createContent = admin
	.route({
		path: "/admin/content",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			subtestId: "number",
			type: "'material' | 'tips_and_trick'",
			title: "string",
			order: "number",
			video: "object?",
			note: "object?",
			practiceQuestionIds: "number[]?",
		}),
	)
	.output(
		type({
			message: "string",
			contentId: "number",
			createdMaterials: "object",
		}),
	)
	.handler(async ({ input }) => {
		const hasVideo = input.video !== undefined && input.video !== null;
		const hasNote = input.note !== undefined && input.note !== null;
		const hasPracticeQuestions =
			input.practiceQuestionIds !== undefined &&
			input.practiceQuestionIds !== null &&
			input.practiceQuestionIds.length > 0;

		if (!hasVideo && !hasNote && !hasPracticeQuestions) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Konten harus memiliki minimal salah satu: video, catatan, atau latihan soal",
			});
		}

		// Validate that tips_and_trick cannot have practice questions
		if (input.type === "tips_and_trick" && hasPracticeQuestions) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Tips & Trick tidak boleh memiliki latihan soal",
			});
		}

		// Validate video structure if provided
		if (hasVideo) {
			if (
				typeof input.video !== "object" ||
				!("title" in input.video) ||
				!("videoUrl" in input.video) ||
				!("content" in input.video) ||
				typeof input.video.title !== "string" ||
				typeof input.video.videoUrl !== "string" ||
				!input.video.videoUrl.trim()
			) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Video harus memiliki title, videoUrl, dan content yang valid",
				});
			}
		}

		// Validate note structure if provided
		if (hasNote) {
			if (typeof input.note !== "object" || !("content" in input.note) || typeof input.note.content !== "object") {
				throw new ORPCError("BAD_REQUEST", {
					message: "Catatan harus memiliki content yang valid (Tiptap JSON)",
				});
			}
		}

		// Create content and materials in a transaction
		const result = await db.transaction(async (tx) => {
			// Insert content item
			const [newContent] = await tx
				.insert(contentItem)
				.values({
					subtestId: input.subtestId,
					type: input.type,
					title: input.title,
					order: input.order,
				})
				.returning();

			if (!newContent)
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Gagal membuat konten",
				});

			const createdMaterials: {
				video?: number;
				note?: number;
				practiceQuestions?: number;
			} = {};

			// Insert video material if provided
			if (hasVideo && input.video) {
				const [video] = await tx
					.insert(videoMaterial)
					.values({
						contentItemId: newContent.id,
						videoUrl: (input.video as { videoUrl: string }).videoUrl,
						content: (input.video as { content: object }).content,
					})
					.returning();

				if (video) createdMaterials.video = video.id;
			}

			// Insert note material if provided
			if (hasNote && input.note) {
				const [note] = await tx
					.insert(noteMaterial)
					.values({
						contentItemId: newContent.id,
						content: (input.note as { content: object }).content,
					})
					.returning();

				if (note) createdMaterials.note = note.id;
			}

			// Insert practice questions if provided (only for material type)
			if (hasPracticeQuestions && input.practiceQuestionIds && input.type === "material") {
				await tx.insert(contentPracticeQuestions).values(
					input.practiceQuestionIds.map((questionId: number, index: number) => ({
						contentItemId: newContent.id,
						questionId,
						order: index + 1,
					})),
				);

				createdMaterials.practiceQuestions = input.practiceQuestionIds.length;
			}

			return {
				contentId: newContent.id,
				createdMaterials,
			};
		});

		return {
			message: "Konten berhasil dibuat",
			contentId: result.contentId,
			createdMaterials: result.createdMaterials,
		};
	});

/**
 * Update content item
 * PATCH /api/admin/content/{id}
 */
const updateContent = admin
	.route({
		path: "/admin/content/{id}",
		method: "PATCH",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			title: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const updateData: { title?: string; order?: number; updatedAt: Date } = {
			updatedAt: new Date(),
		};

		if (input.title !== undefined) updateData.title = input.title;
		if (input.order !== undefined) updateData.order = input.order;

		const [updated] = await db.update(contentItem).set(updateData).where(eq(contentItem.id, input.id)).returning();

		if (!updated)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		return { message: "Konten berhasil diperbarui" };
	});

/**
 * Delete content item
 * DELETE /api/admin/content/{id}
 */
const deleteContent = admin
	.route({
		path: "/admin/content/{id}",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const [deleted] = await db.delete(contentItem).where(eq(contentItem.id, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		return { message: "Konten berhasil dihapus" };
	});

/**
 * Reorder content items
 * PATCH /api/admin/content/reorder
 */
const reorderContent = admin
	.route({
		path: "/admin/content/reorder",
		method: "PATCH",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			subtestId: "number",
			type: "'material' | 'tips_and_trick'",
			items: "unknown",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// Validate items array at runtime
		if (!Array.isArray(input.items)) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Items harus berupa array",
			});
		}

		const items = input.items as { id: number; order: number }[];

		// Validate each item
		for (const item of items) {
			if (typeof item.id !== "number" || typeof item.order !== "number") {
				throw new ORPCError("BAD_REQUEST", {
					message: "Setiap item harus memiliki id dan order bertipe number",
				});
			}
		}

		// Use transaction for atomic updates
		// First set all orders to negative values to avoid unique constraint violation
		// Then set them to their final values
		await db.transaction(async (tx) => {
			// Step 1: Set all orders to negative (temporary) values
			for (const [i, item] of items.entries()) {
				await tx
					.update(contentItem)
					.set({ order: -(i + 1000), updatedAt: new Date() })
					.where(
						and(
							eq(contentItem.id, item.id),
							eq(contentItem.subtestId, input.subtestId),
							eq(contentItem.type, input.type),
						),
					);
			}

			// Step 2: Set final order values
			for (const item of items) {
				await tx
					.update(contentItem)
					.set({ order: item.order, updatedAt: new Date() })
					.where(
						and(
							eq(contentItem.id, item.id),
							eq(contentItem.subtestId, input.subtestId),
							eq(contentItem.type, input.type),
						),
					);
			}
		});

		return { message: "Urutan konten berhasil diperbarui" };
	});

/**
 * Add/Update video material
 * POST /api/admin/content/{id}/video
 */
const upsertVideo = admin
	.route({
		path: "/admin/content/{id}/video",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			videoUrl: "string",
			content: "object",
		}),
	)
	.output(type({ message: "string", videoId: "number" }))
	.handler(async ({ input }) => {
		// Validate video URL
		if (!input.videoUrl) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Video URL wajib diisi",
			});
		}

		// Check if content exists
		const [content] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Upsert video material
		const [video] = await db
			.insert(videoMaterial)
			.values({
				contentItemId: input.id,
				videoUrl: input.videoUrl,
				content: input.content,
			})
			.onConflictDoUpdate({
				target: videoMaterial.contentItemId,
				set: {
					videoUrl: input.videoUrl,
					content: input.content,
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!video)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal menyimpan video material",
			});

		return { message: "Video material berhasil disimpan", videoId: video.id };
	});

/**
 * Delete video material
 * DELETE /api/admin/content/{id}/video
 */
const deleteVideo = admin
	.route({
		path: "/admin/content/{id}/video",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const [deleted] = await db.delete(videoMaterial).where(eq(videoMaterial.contentItemId, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Video material tidak ditemukan",
			});

		return { message: "Video material berhasil dihapus" };
	});

/**
 * Add/Update note material
 * POST /api/admin/content/{id}/note
 */
const upsertNote = admin
	.route({
		path: "/admin/content/{id}/note",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			content: "object", // Tiptap JSON
		}),
	)
	.output(type({ message: "string", noteId: "number" }))
	.handler(async ({ input }) => {
		// Check if content exists
		const [content] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Upsert note material
		const [note] = await db
			.insert(noteMaterial)
			.values({
				contentItemId: input.id,
				content: input.content,
			})
			.onConflictDoUpdate({
				target: noteMaterial.contentItemId,
				set: {
					content: input.content,
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!note)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal menyimpan catatan material",
			});

		return {
			message: "Catatan material berhasil disimpan",
			noteId: note.id,
		};
	});

/**
 * Delete note material
 * DELETE /api/admin/content/{id}/note
 */
const deleteNote = admin
	.route({
		path: "/admin/content/{id}/note",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		const [deleted] = await db.delete(noteMaterial).where(eq(noteMaterial.contentItemId, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Catatan material tidak ditemukan",
			});

		return { message: "Catatan material berhasil dihapus" };
	});

/**
 * Link practice questions to content (only for Material type)
 * POST /api/admin/content/{id}/practice-questions
 */
const linkPracticeQuestions = admin
	.route({
		path: "/admin/content/{id}/practice-questions",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			questionIds: "number[]",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// Check if content exists and is Material type
		const [content] = await db
			.select({ id: contentItem.id, type: contentItem.type })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Content not found",
			});

		if (content.type === "tips_and_trick") {
			throw new ORPCError("BAD_REQUEST", {
				message: "Tips & Trick cannot have practice questions",
			});
		}

		// Delete existing practice question links
		await db.delete(contentPracticeQuestions).where(eq(contentPracticeQuestions.contentItemId, input.id));

		// Insert new practice question links
		if (input.questionIds.length > 0) {
			await db.insert(contentPracticeQuestions).values(
				input.questionIds.map((questionId: number, index: number) => ({
					contentItemId: input.id,
					questionId,
					order: index + 1,
				})),
			);
		}

		return { message: "Latihan soal berhasil dihubungkan ke konten" };
	});

/**
 * Remove practice questions from content
 * DELETE /api/admin/content/{id}/practice-questions
 */
const unlinkPracticeQuestions = admin
	.route({
		path: "/admin/content/{id}/practice-questions",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		await db.delete(contentPracticeQuestions).where(eq(contentPracticeQuestions.contentItemId, input.id));

		return { message: "Latihan soal berhasil dihapus dari konten" };
	});

export const adminSubtestRouter = {
	createSubtest,
	updateSubtest,
	deleteSubtest,
	reorderSubtests,
	createContent,
	updateContent,
	deleteContent,
	reorderContent,
	upsertVideo,
	deleteVideo,
	upsertNote,
	deleteNote,
	linkPracticeQuestions,
	unlinkPracticeQuestions,
};
