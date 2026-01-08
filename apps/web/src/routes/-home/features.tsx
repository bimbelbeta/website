import { Image } from "@unpic/react";
import { motion } from "motion/react";
import Carousel from "@/components/carousel";
import { MotionPulse } from "@/components/motion";
import { DATA } from "./data";

export function Features() {
	return (
		<section className="overflow-x-hidden bg-background py-16">
			<div className="container mx-auto flex w-full max-w-4xl flex-col gap-20 px-4">
				<div className="relative w-full">
					<MotionPulse>
						<motion.div
							className="absolute -top-20 -left-14 z-20 md:-top-24 md:-left-16"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1, duration: 0.3 }}
						>
							<Image
								src="/decorations/graduation-cap.webp"
								alt=""
								layout="constrained"
								width={400}
								height={400}
								className="h-auto w-36 md:w-40"
							/>
						</motion.div>
					</MotionPulse>
					<MotionPulse>
						<motion.div
							className="absolute -top-12 -left-30 z-0 size-40 rounded-full bg-primary-100 md:size-46"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2, duration: 0.3 }}
						/>
					</MotionPulse>
					<MotionPulse>
						<motion.div
							className="absolute -top-0 -right-16 z-0"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3, duration: 0.3 }}
						>
							<Image
								src="/decorations/green-yellow-double-circle.webp"
								alt=""
								layout="constrained"
								width={120}
								height={120}
								className="h-auto w-20 md:w-28"
							/>
						</motion.div>
					</MotionPulse>

					<motion.div
						className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[30%_70%]">
							<div className="absolute top-38 -left-40 z-0 size-100 rounded-full bg-tertiary-100 sm:top-30 md:top-50 md:left-60 md:size-54" />

							<div className="relative z-10 space-y-3 text-center md:text-left">
								<motion.h2
									className="font-bold text-2xl md:text-3xl"
									whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
								>
									Bersama <span className="text-primary">bimbelbeta</span>
								</motion.h2>
								<p className="text-foreground text-sm leading-relaxed">
									Mulai dari 3 menit sehari. bimbelbeta{" "}
									<span className="font-bold text-(--tt-color-yellow-dec-2)">membangun kebiasaan</span> lewat streak dan
									latihan mini yang ringan.
								</p>
							</div>

							<motion.div
								className="relative mt-6 -mb-8 md:mt-10 md:mb-0"
								whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
							>
								<div className="mx-auto w-[90%] md:absolute md:-right-16 md:-bottom-10 md:mx-0 md:w-auto">
									<Image
										src="/images/dashboard-page.webp"
										alt="bimbelbeta Dashboard"
										width={800}
										height={600}
										layout="constrained"
										className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
									/>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Testimone Section */}
				<div className="container relative mx-auto flex w-full max-w-4xl flex-col overflow-visible px-4">
					<MotionPulse>
						<motion.div
							className="absolute -right-50 z-2 size-75 translate-y-1/2 rounded-full bg-primary-100"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.4, duration: 0.3 }}
						/>
					</MotionPulse>

					<MotionPulse>
						<motion.div
							className="absolute top-10 -left-30 z-2 size-45 rounded-full bg-fourtiary-100"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.5, duration: 0.3 }}
						/>
					</MotionPulse>

					<MotionPulse>
						<motion.div
							className="absolute top-10 -left-40 z-2 size-11 rounded-full bg-yellow-100"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.6, duration: 0.3 }}
						/>
					</MotionPulse>

					<MotionPulse>
						<motion.div
							className="absolute -top-3 -left-50 z-2 w-62.5 translate-y-1/2 sm:w-75"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.7, duration: 0.3 }}
						>
							<Image src="/decorations/book.webp" alt="Buku Wan***t" width={300} height={150} className="h-auto" />
						</motion.div>
					</MotionPulse>

					<MotionPulse>
						<motion.div
							className="absolute -top-3 -right-25 z-4 w-62.5 -translate-y-1/2 lg:-right-35 lg:translate-y-1/2"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.8, duration: 0.3 }}
						>
							<Image src="/decorations/pencil.webp" alt="Pensil 2B" width={300} height={150} className="h-auto" />
						</motion.div>
					</MotionPulse>

					<motion.div
						className="relative z-3 flex flex-col gap-y-32 rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-8"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.5, duration: 0.3 }}
					>
						<div className="mb-4 text-center">
							<h2 className="font-bold text-2xl">
								Ruang Aman untuk <span className="text-primary-300">Bertanya & Tumbuh</span>
							</h2>
							<p className="font-medium text-sm">Ribuan siswa telah menemukan rumah kedua mereka di sini.</p>
						</div>

						<Image
							src="/avatar/testimone-avatar.webp"
							alt="Empty State"
							width={300}
							height={150}
							className="absolute inset-0 m-auto w-62.5 sm:w-75"
						/>

						<Carousel
							items={[...DATA.testimone]}
							showNavigation={true}
							showDots={true}
							autoPlay={false}
							gap={36}
							responsiveGap={true}
							className=""
						/>
					</motion.div>
				</div>

				<div className="relative">
					<MotionPulse>
						<motion.div
							className="absolute -bottom-12 -left-30 z-0 size-40 rounded-full bg-tertiary-100 md:size-46"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.9, duration: 0.3 }}
						/>
					</MotionPulse>

					<motion.div
						className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						<MotionPulse>
							<motion.div
								className="absolute top-40 -right-20 z-0 md:top-50 md:-right-10"
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 1, duration: 0.3 }}
							>
								<Image
									src="/decorations/green-yellow-2-circle.webp"
									alt=""
									layout="constrained"
									width={120}
									height={120}
									className="h-auto w-100 md:w-60"
								/>
							</motion.div>
						</MotionPulse>

						<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[70%_30%]">
							<motion.div
								className="relative order-2 mt-6 -mb-8 md:order-1 md:mt-0 md:mb-0"
								whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
							>
								<div className="mx-auto w-[90%] md:absolute md:-bottom-10 md:-left-16 md:mx-0 md:w-auto">
									<Image
										src="/images/kelas-page.webp"
										alt="bimbelbeta Kelas"
										width={800}
										height={600}
										layout="constrained"
										className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
									/>
								</div>
							</motion.div>

							<div className="relative z-10 order-1 space-y-3 text-center md:order-2 md:text-right">
								<h2 className="font-bold text-2xl md:text-3xl">
									<motion.span
										className="inline-block text-primary"
										whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
									>
										Penjelasan Jelas
									</motion.span>
									.{" "}
									<span className="block">
										<motion.span
											className="inline-block text-primary"
											whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
										>
											Strategi Praktis
										</motion.span>
										.
									</span>
								</h2>
								<p className="text-foreground text-sm leading-relaxed">
									Pembelajaran yang mudah diikuti dan dirancang membangun progres jangka panjang.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
