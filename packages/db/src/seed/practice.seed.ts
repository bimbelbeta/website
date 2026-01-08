import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { practicePack, practicePackQuestions, question, questionAnswerOption } from "../schema/practice-pack";

export async function clearPractice(db: NodePgDatabase) {
	console.log("Clearing practice data...");

	await db.delete(practicePackQuestions);
	await db.delete(questionAnswerOption);
	await db.delete(question);
	await db.delete(practicePack);

	console.log("Practice data cleared");
}

export async function seedPractice(db: NodePgDatabase) {
	console.log("Seeding practice data...");

	const subjects = [
		"Matematika Dasar",
		"Bahasa Indonesia",
		"Bahasa Inggris",
		"Pengetahuan Umum",
		"Logika & Penalaran",
		"Sejarah Indonesia",
		"Geografi",
		"Biologi",
		"Fisika",
		"Kimia",
	];

	const questionTemplates = [
		{
			prefix: "Berapa hasil dari",
			options: ["12", "15", "18", "20"],
			correctIndex: 0,
		},
		{
			prefix: "Apa ibu kota dari",
			options: ["Jakarta", "Surabaya", "Bandung", "Medan"],
			correctIndex: 0,
		},
		{
			prefix: "Siapa yang menemukan",
			options: ["Albert Einstein", "Isaac Newton", "Galileo", "Archimedes"],
			correctIndex: 1,
		},
		{
			prefix: "Kapan Indonesia merdeka",
			options: ["17 Agustus 1945", "1 Juni 1945", "20 Mei 1908", "28 Oktober 1928"],
			correctIndex: 0,
		},
		{
			prefix: "Manakah yang termasuk",
			options: ["Semua benar", "A dan B benar", "B dan C benar", "A dan C benar"],
			correctIndex: 0,
		},
	];

	for (let packIndex = 0; packIndex < 10; packIndex++) {
		const subject = subjects[packIndex];

		const [pack] = await db
			.insert(practicePack)
			.values({
				title: `Paket Latihan ${subject}`,
				description: `Kumpulan soal-soal ${subject} untuk persiapan ujian. Paket ini berisi 30 soal pilihan ganda dengan pembahasan lengkap untuk setiap soalnya.`,
			})
			.returning();

		if (!pack) {
			throw new Error("Failed to create practice pack");
		}

		console.log(`Created pack: ${pack.title}`);

		for (let questionIndex = 0; questionIndex < 30; questionIndex++) {
			const template = questionTemplates[questionIndex % questionTemplates.length];
			if (!template) {
				throw new Error("Template not found");
			}

			const questionNum = questionIndex + 1;

			const [createdQuestion] = await db
				.insert(question)
				.values({
					content: `${template.prefix} pertanyaan nomor ${questionNum} pada materi ${subject}?`,
					discussion: `Pembahasan soal nomor ${questionNum}: Untuk menjawab soal ini, kita perlu memahami konsep dasar dari ${subject}. Jawaban yang benar dapat ditemukan dengan menganalisis setiap opsi yang tersedia. Opsi yang benar adalah opsi A karena sesuai dengan teori dan konsep yang telah dipelajari.`,
				})
				.returning();

			if (!createdQuestion) {
				throw new Error("Failed to create question");
			}

			const answerCodes = ["A", "B", "C", "D"] as const;
			for (let i = 0; i < 4; i++) {
				const optionContent = template.options[i];
				if (!optionContent) {
					throw new Error(`Option ${i} not found in template`);
				}

				await db.insert(questionAnswerOption).values({
					code: answerCodes[i] as string,
					questionId: createdQuestion.id,
					content: optionContent as string,
					isCorrect: i === template.correctIndex,
				});
			}

			await db.insert(practicePackQuestions).values({
				practicePackId: pack.id,
				questionId: createdQuestion.id,
				order: questionNum,
			});
		}

		console.log(`  Added 30 questions to pack ${packIndex + 1}`);
	}

	console.log("Practice data seeded successfully!");
	console.log("Summary:");
	console.log("  - 10 practice packs created");
	console.log("  - 300 questions created (30 per pack)");
	console.log("  - 1200 answer options created (4 per question)");
}
