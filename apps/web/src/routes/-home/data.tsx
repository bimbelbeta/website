import { InstagramLogoIcon, TiktokLogoIcon } from "@phosphor-icons/react";

export const DATA = {
	testimone: [
		{
			id: 1,
			name: "Nadia Putri",
			title: "Siswa SMA",
			desc: "bimbelbeta bantu aku lebih teratur belajar UTBK. Fitur flashcard harian dan penjelasan materi bikin makin paham dan nggak gampang lupa!",
		},
		{
			id: 2,
			name: "Rafi Pratama",
			title: "Peserta Gap Year",
			desc: "Dulu aku bingung mulai belajar dari mana. Setelah pakai bimbelbeta, kemajuan belajarku jadi lebih terarah. Analisis tryoutnya jujur ngebantu banget!",
		},
		{
			id: 3,
			name: "Siti Hanifah",
			title: "Calon Mahasiswa",
			desc: "Materi premium-nya lengkap dan gampang diakses. Aku bisa tanya-tanya juga di komunitasnya, makin semangat belajar bareng teman seperjuangan.",
		},
		{
			id: 4,
			name: "Angga Wijaya",
			title: "Pengguna Setia",
			desc: "Aplikasi belajar online paling worth it buat persiapan UTBK. Progresku setiap hari kelihatan jelas, bikin makin rajin belajar!",
		},
	],
	pricing: {
		title: "Investasi Belajar yang Bikin Kamu Bertumbuh",
		subtitle: "Mulai gratis. Upgrade kalau mau kebiasaan yang lebih kuat.",
		starter: {
			label: "Starter",
			price: "Gratis",
			features: ["Tracking Progress & Streak", "Akses Materi Dasar", "Flashcard Harian", "Komunitas Dasar"],
			cta: "Mulai Gratis Sekarang",
		},
		premium: {
			label: "Premium",
			price: "Rp100.000",
			suffix: "/bulan",
			features: [
				"Ratusan Video Pembahasan",
				"Tryout & Analisis Kedalaman",
				"Tips & Tricks Materi",
				"Semua Fitur Gratis",
			],
			cta: "Langganan Sekarang",
		},
	},
	footer: {
		socials: [
			{
				label: "Instagram",
				icon: InstagramLogoIcon,
				url: "https://www.instagram.com/bimbelbeta",
			},
			// {
			// 	label: "Twitter",
			// 	icon: TwitterLogoIcon,
			// 	url: "https://www.twitter.com/bimbelbeta",
			// },
			// {
			// 	label: "Discord",
			// 	icon: DiscordLogoIcon,
			// 	url: "https://discord.gg/bimbelbeta",
			// },
			{
				label: "TikTok",
				icon: TiktokLogoIcon,
				url: "https://www.tiktok.com/@bimbelbeta",
			},
			// {
			// 	label: "YouTube",
			// 	icon: YoutubeLogoIcon,
			// 	url: "https://www.youtube.com/@bimbelbeta",
			// },
		],
	},
} as const;
