import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion";
import { useAnimatedCounter } from "@/hooks/use-animations";

function StatCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
	const { value: animatedValue } = useAnimatedCounter(value, 1200, 0);

	return (
		<span className="font-bold text-6xl text-primary-300">
			{animatedValue}
			{suffix}
		</span>
	);
}

export function Statistics() {
	return (
		<section className="overflow-x-hidden bg-background py-16">
			<div className="container mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
				<div className="relative">
					<MotionPulse>
						<motion.div
							className="absolute -top-12 -left-16 z-0 size-20 rounded-full bg-yellow-100 md:size-28"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1, duration: 0.3 }}
						/>
					</MotionPulse>
					<MotionPulse>
						<motion.div
							className="absolute -right-35 -bottom-50 z-0 size-56 rounded-full bg-tertiary-100 md:size-64"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2, duration: 0.3 }}
						/>
					</MotionPulse>

					<motion.div
						className="relative overflow-hidden rounded-2xl bg-neutral-100 p-8 pb-40 shadow-sm md:pb-8 md:pl-56"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.3 }}
					>
						<div className="absolute -bottom-24 -left-24 z-0">
							<Image
								src="/decorations/dark-blue-double-circle.webp"
								alt=""
								layout="constrained"
								width={120}
								height={120}
								className="h-auto w-64"
							/>
						</div>
						<div className="absolute bottom-10 -left-3 -mb-8 -ml-4 md:-bottom-8 md:mb-8 md:-ml-6">
							<Image
								src="/avatar/study-avatar.webp"
								alt=""
								layout="constrained"
								width={200}
								height={200}
								className="h-auto w-40"
							/>
						</div>

						<div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
							<div className="flex flex-col items-center gap-2 text-center">
								<h3 className="font-medium text-sm">Fokus Lulus PTN tetapi</h3>
								<StatCounter value={87} suffix="%" />
								<p className="text-sm leading-relaxed">
									Mahasiswa salah jurusan. Akibat belajar tanpa fondasi yang benar.
								</p>
							</div>

							<div className="flex flex-col items-center gap-2 text-center">
								<h3 className="font-medium text-sm">Tantangan pasca lulus</h3>
								<StatCounter value={40} suffix="%" />
								<p className="text-sm leading-relaxed">
									mengalami Academic Shock akibat tidak punya habit belajar mandiri.
								</p>
							</div>
						</div>
					</motion.div>
				</div>

				<div className="relative w-full">
					<MotionPulse>
						<motion.div
							className="absolute -top-24 -right-10 z-20 md:-top-28 md:-right-20"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3, duration: 0.3 }}
						>
							<Image
								src="/decorations/acorn.webp"
								alt=""
								layout="constrained"
								width={200}
								height={200}
								className="h-auto w-24 md:w-32"
							/>
						</motion.div>
					</MotionPulse>

					<motion.div
						className="relative overflow-hidden rounded-2xl bg-primary-300 p-6 pb-12 text-white md:p-8 md:pr-80 md:pb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3, duration: 0.3 }}
					>
						<div className="absolute -right-8 -bottom-12 hidden md:block">
							<Image
								src="/avatar/climb-avatar.webp"
								alt=""
								layout="constrained"
								width={300}
								height={300}
								className="h-auto w-72 opacity-90"
							/>
						</div>

						<div className="absolute -bottom-24 -left-10 z-0">
							<Image
								src="/decorations/dark-blue-double-circle.webp"
								alt=""
								layout="constrained"
								width={120}
								height={120}
								className="h-auto w-64 -rotate-70 opacity-30"
							/>
						</div>

						<div className="relative z-10 text-center md:text-left">
							<h3 className="mb-3 font-bold text-xl md:text-2xl">
								bimbelbeta Hadir{" "}
								<motion.span
									className="inline-block text-[var(--tt-color-yellow-inc-3)]"
									whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
								>
									Membangun Fondasi
								</motion.span>
								, Bukan Sekadar Mengejar Nilai.
							</h3>
							<p className="text-sm leading-relaxed md:text-base">
								Tak cuma latihan soal. Kami bangun Study Habit & mental hingga kuliah.
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
