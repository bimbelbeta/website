import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { contentItem, noteMaterial, recentContentView, subtest, userProgress, videoMaterial } from "../schema/subtest";

const SUBTEST_DATA = [
	{
		name: "Kemampuan Penalaran Umum",
		shortName: "PU",
		description: "Mengukur kemampuan berpikir logis, analitis, dan kritis melalui penalaran deduktif dan induktif.",
		order: 1,
	},
	{
		name: "Pengetahuan dan Pemahaman Umum",
		shortName: "PPU",
		description: "Mengukur kemampuan memahami dan menganalisis informasi dari berbagai teks dan konteks.",
		order: 2,
	},
	{
		name: "Kemampuan Memahami Bacaan dan Menulis",
		shortName: "PBM",
		description: "Mengukur kemampuan memahami isi bacaan, menemukan ide pokok, dan menyusun kalimat yang efektif.",
		order: 3,
	},
	{
		name: "Pengetahuan Kuantitatif",
		shortName: "PK",
		description: "Mengukur kemampuan menggunakan konsep matematika dasar dan penalaran numerik.",
		order: 4,
	},
	{
		name: "Literasi dalam Bahasa Indonesia",
		shortName: "LBI",
		description: "Mengukur kemampuan memahami, menganalisis, dan mengevaluasi teks berbahasa Indonesia.",
		order: 5,
	},
	{
		name: "Literasi dalam Bahasa Inggris",
		shortName: "LBing",
		description: "Mengukur kemampuan memahami dan menganalisis teks berbahasa Inggris.",
		order: 6,
	},
	{
		name: "Penalaran Matematika",
		shortName: "PM",
		description: "Mengukur kemampuan penalaran dan pemecahan masalah menggunakan konsep matematika tingkat lanjut.",
		order: 7,
	},
];

// const SAMPLE_CONTENT = [
// 	{
// 		subtestShortName: "PU",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Pendalaman Penalaran Logis dan Pola Berpikir",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=sqoOzGMqCQU",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "heading",
// 								attrs: { level: 2 },
// 								content: [{ type: "text", text: "Pendahuluan" }],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Penalaran logis merupakan fondasi utama dalam menyelesaikan soal kognitif.",
// 									},
// 								],
// 							},

// 							{
// 								type: "heading",
// 								attrs: { level: 3 },
// 								content: [{ type: "text", text: "Definisi Premis" }],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Premis adalah pernyataan yang diasumsikan benar.",
// 									},
// 								],
// 							},

// 							{
// 								type: "bulletList",
// 								content: [
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Premis eksplisit" }],
// 											},
// 										],
// 									},
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Premis implisit" }],
// 											},
// 										],
// 									},
// 								],
// 							},

// 							{
// 								type: "codeBlock",
// 								attrs: { language: "text" },
// 								content: [
// 									{
// 										type: "text",
// 										text: "Jika A maka B\nA\nMaka B",
// 									},
// 								],
// 							},

// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Paragraf panjang 1 untuk testing scroll.",
// 									},
// 								],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Paragraf panjang 2 untuk testing scroll.",
// 									},
// 								],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Paragraf panjang 3 untuk testing scroll.",
// 									},
// 								],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Paragraf panjang 4 untuk testing scroll.",
// 									},
// 								],
// 							},
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Paragraf panjang 5 untuk testing scroll.",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Fokus pada premis dan hindari asumsi tambahan.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Framework Cepat Soal Logika",
// 				order: 2,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "orderedList",
// 							content: [
// 								{
// 									type: "listItem",
// 									content: [
// 										{
// 											type: "paragraph",
// 											content: [{ type: "text", text: "Identifikasi premis" }],
// 										},
// 									],
// 								},
// 								{
// 									type: "listItem",
// 									content: [
// 										{
// 											type: "paragraph",
// 											content: [{ type: "text", text: "Uji konsistensi" }],
// 										},
// 									],
// 								},
// 								{
// 									type: "listItem",
// 									content: [
// 										{
// 											type: "paragraph",
// 											content: [{ type: "text", text: "Eliminasi opsi lemah" }],
// 										},
// 									],
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "material" as const,
// 				title: "Memahami Informasi Faktual dan Opini",
// 				order: 3,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=ppu1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "PPU menguji pemahaman terhadap fakta, opini, dan hubungan sebab-akibat.",
// 									},
// 								],
// 							},
// 							{
// 								type: "bulletList",
// 								content: [
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Fakta dapat diverifikasi" }],
// 											},
// 										],
// 									},
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Opini bersifat subjektif" }],
// 											},
// 										],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Selalu cek konteks pernyataan." }],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Cara Cepat Bedakan Fakta & Opini",
// 				order: 4,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Cari kata nilai seperti ‘menurut’, ‘seharusnya’.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "PPU",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Memahami Informasi Faktual dan Opini",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=ppu1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "PPU menguji pemahaman terhadap fakta, opini, dan hubungan sebab-akibat.",
// 									},
// 								],
// 							},
// 							{
// 								type: "bulletList",
// 								content: [
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Fakta dapat diverifikasi" }],
// 											},
// 										],
// 									},
// 									{
// 										type: "listItem",
// 										content: [
// 											{
// 												type: "paragraph",
// 												content: [{ type: "text", text: "Opini bersifat subjektif" }],
// 											},
// 										],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Selalu cek konteks pernyataan." }],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Cara Cepat Bedakan Fakta & Opini",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Cari kata nilai seperti ‘menurut’, ‘seharusnya’.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "PBM",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Menentukan Ide Pokok dan Kalimat Utama",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=pbm1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Ide pokok adalah gagasan utama yang menaungi seluruh paragraf.",
// 									},
// 								],
// 							},
// 							{
// 								type: "blockquote",
// 								content: [
// 									{
// 										type: "paragraph",
// 										content: [
// 											{
// 												type: "text",
// 												text: "Biasanya terletak di awal atau akhir paragraf.",
// 											},
// 										],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Jangan tertipu contoh atau detail." }],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Kesalahan Umum Menentukan Ide Pokok",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "bulletList",
// 							content: [
// 								{
// 									type: "listItem",
// 									content: [
// 										{
// 											type: "paragraph",
// 											content: [{ type: "text", text: "Memilih kalimat contoh" }],
// 										},
// 									],
// 								},
// 								{
// 									type: "listItem",
// 									content: [
// 										{
// 											type: "paragraph",
// 											content: [{ type: "text", text: "Memilih data pendukung" }],
// 										},
// 									],
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "PK",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Operasi Hitung Dasar dan Estimasi",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=pk1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "PK menguji ketelitian dalam operasi hitung dan estimasi numerik.",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Gunakan pembulatan untuk estimasi cepat.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Hitung Cepat Tanpa Kalkulator",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Sederhanakan angka sebelum menghitung.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "LBI",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Menganalisis Teks Argumentatif",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=lbi1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "Teks argumentatif menyajikan pendapat yang didukung alasan dan data.",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Identifikasi klaim dan alasan pendukung.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Cara Membaca Kritis",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Periksa bias dan konsistensi argumen." }],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "LBing",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Reading Comprehension Strategy",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=lb1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "English reading comprehension focuses on context and inference.",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Pay attention to transition words." }],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Skimming & Scanning",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [
// 								{
// 									type: "text",
// 									text: "Read first and last sentence of paragraphs.",
// 								},
// 							],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},

// 	{
// 		subtestShortName: "PM",
// 		contents: [
// 			{
// 				type: "material" as const,
// 				title: "Pola dan Relasi Bilangan",
// 				order: 1,
// 				video: {
// 					videoUrl: "https://www.youtube.com/watch?v=pm1",
// 					content: {
// 						type: "doc",
// 						version: 1,
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [
// 									{
// 										type: "text",
// 										text: "PM menguji kemampuan menemukan pola dan relasi numerik.",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				},
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Perhatikan selisih dan rasio." }],
// 						},
// 					],
// 				},
// 			},
// 			{
// 				type: "tips_and_trick" as const,
// 				title: "Strategi Soal Deret",
// 				order: 1,
// 				notes: {
// 					type: "doc",
// 					version: 1,
// 					content: [
// 						{
// 							type: "paragraph",
// 							content: [{ type: "text", text: "Tuliskan deret secara eksplisit." }],
// 						},
// 					],
// 				},
// 			},
// 		],
// 	},
// ];

export async function clearSubtest(db: NodePgDatabase) {
	try {
		await db.delete(userProgress);
	} catch {
		console.log("user_progress table not found, skipping clear");
	}

	try {
		await db.delete(recentContentView);
	} catch {
		console.log("recent_content_view table not found, skipping clear");
	}

	try {
		await db.delete(videoMaterial);
	} catch {
		console.log("video_material table not found, skipping clear");
	}

	try {
		await db.delete(noteMaterial);
	} catch {
		console.log("note_material table not found, skipping clear");
	}

	try {
		await db.delete(contentItem);
	} catch {
		console.log("content_item table not found, skipping clear");
	}

	try {
		await db.delete(subtest);
	} catch {
		console.log("subtest table not found, skipping clear");
	}
}

export async function seedSubtest(db: NodePgDatabase) {
	await db.transaction(async (tx) => {
		const insertedSubtests = await tx.insert(subtest).values(SUBTEST_DATA).returning({
			id: subtest.id,
			shortName: subtest.shortName,
		});

		console.log(`Subtest: ${insertedSubtests.length} created`);

		// const contentItemIds: number[] = [];

		// for (const sample of SAMPLE_CONTENT) {
		// 	const targetSubtest = insertedSubtests.find((s) => s.shortName === sample.subtestShortName);
		// 	if (!targetSubtest) continue;

		// 	for (const content of sample.contents) {
		// 		const [row] = await tx
		// 			.insert(contentItem)
		// 			.values({
		// 				subtestId: targetSubtest.id,
		// 				type: content.type,
		// 				title: content.title,
		// 				order: content.order,
		// 			})
		// 			.returning({ id: contentItem.id });

		// 		if (!row) throw new Error("Failed to insert content item");

		// 		const contentItemId = row.id;
		// 		contentItemIds.push(contentItemId);

		// 		if (content.video) {
		// 			const videoContent =
		// 				"content" in content.video && content.video.content
		// 					? content.video.content
		// 					: {
		// 							type: "doc",
		// 							version: 1,
		// 							content: [],
		// 						};

		// 			const serializedContent = JSON.parse(JSON.stringify(videoContent));

		// 			await tx.insert(videoMaterial).values({
		// 				contentItemId,
		// 				videoUrl: content.video.videoUrl,
		// 				content: serializedContent,
		// 			});
		// 		}

		// 		if (content.notes) {
		// 			const serializedNotes = JSON.parse(JSON.stringify(content.notes));

		// 			await tx.insert(noteMaterial).values({
		// 				contentItemId,
		// 				content: serializedNotes,
		// 			});
		// 		}
		// 	}
		// }

		// console.log("Content items created");
	});
}
