import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionFloat } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import { bounce } from "@/lib/animation-variants";

export function Hero() {
	return (
		<section className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-start overflow-hidden bg-background pt-20">
			<div className="container mx-auto flex max-w-5xl shrink-0 flex-col items-center px-4 pt-8 md:pt-20">
				<div className="flex max-w-3xl flex-col items-center gap-3 text-center md:gap-4">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0 }}
						className="font-bold font-sans text-3xl sm:text-4xl md:text-5xl"
					>
						Ubah Persiapan Ujian Menjadi{" "}
						<motion.span
							className="inline-block text-primary-300"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							Investasi Masa Depan
						</motion.span>
					</motion.h2>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						className="text-sm sm:text-base"
					>
						Tidak hanya membantumu menaklukkan SNBT, tapi bimbelbeta juga membentuk growth mindset untuk tantangan masa
						depan.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
						className="grid w-full grid-cols-2 items-center justify-center gap-2 *:max-sm:text-xs sm:flex"
					>
						<Button asChild size="sm" className="flex-1 px-3 sm:w-auto sm:flex-initial">
							<motion.div variants={bounce} whileHover="whileHover">
								<Link to="/login">Mulai Belajar Sekarang</Link>
							</motion.div>
						</Button>
						<motion.div variants={bounce} whileHover="whileHover">
							<Button variant="outline" size="sm" className="flex-1 px-3 sm:w-auto sm:flex-initial">
								<Link to="/dashboard">Cara Kerjanya</Link>
							</Button>
						</motion.div>
					</motion.div>
				</div>
			</div>

			<MotionFloat delay={0.3}>
				<Image src="/images/hero-image.webp" alt="Hero Illustration" layout="fullWidth" className="" />
			</MotionFloat>
		</section>
	);
}
