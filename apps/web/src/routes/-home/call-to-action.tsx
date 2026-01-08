import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { bounce } from "@/lib/animation-variants";

export function CallToAction() {
	return (
		<div className="relative overflow-hidden pb-44 sm:pb-36">
			{/* Left Avatar */}
			<motion.div
				className="absolute bottom-0 left-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.3, duration: 0.3 }}
			>
				<img src="/avatar/footer-left.webp" alt="" className="w-[200px] xl:w-[280px]" />
			</motion.div>

			{/* Right Avatar & Decorations */}
			<div className="absolute right-0 bottom-0">
				<div className="relative">
					<motion.div
						className="relative z-10"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.4, duration: 0.3 }}
					>
						<img src="/avatar/footer-right.webp" alt="" className="w-[200px] xl:w-[280px]" />
					</motion.div>

					{/* Decorative Circles (Buletan) */}
					{/* <div className="absolute -top-10 -right-4 flex items-center justify-center">
						<div className="size-[91px] rounded-full bg-[#76E8AC]" />
					</div>
					<div className="absolute -top-4 right-16 flex items-center justify-center">
						<div className="size-[35px] rounded-full bg-[#FFDB43]" />
					</div> */}
					<motion.div
						className="absolute -right-20 -bottom-10 z-0 size-40 rounded-full bg-tertiary-100 md:size-80"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.5, duration: 0.3 }}
					/>
				</div>
			</div>

			<div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-2 pt-40 pb-26 text-center">
				<motion.h2
					className="font-bold font-sans text-4xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					Kamu Punya{" "}
					<motion.span
						className="inline-block text-primary-300"
						whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
					>
						Potensi
					</motion.span>
					,<br />
					Kami Punya{" "}
					<motion.span
						className="inline-block text-primary-300"
						whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
					>
						Strateginya
					</motion.span>
					!
				</motion.h2>

				<motion.p
					className="text-pretty"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					Berhenti menebak-nebak cara belajar yang benar. Biarkan kami membimbingmu memaksimalkan setiap potensi yang
					kamu miliki.
				</motion.p>

				<motion.div variants={bounce} whileHover="whileHover">
					<Button asChild className="relative">
						<Link to="/login">Mulai Perjalananmu</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
