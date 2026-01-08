import { ArrowRightIcon, MedalIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export function Pricing() {
	const { title, subtitle, starter, premium } = DATA.pricing;

	return (
		<Container>
			<div className="mb-4 text-center">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="font-medium text-sm">{subtitle}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
				<StarterCard data={starter} />
				<PremiumCard data={premium} />
			</div>
		</Container>
	);
}

function StarterCard({ data }: { data: typeof DATA.pricing.starter }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.34, 1.3, 0.64, 1] } }}
			className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm"
		>
			{/* Top */}
			<div className="relative z-1">
				<h3 className="font-medium text-base">{data.label}</h3>
				<p className="font-bold text-4xl text-primary-300">{data.price}</p>
			</div>

			{/* Bottom */}
			<div className="relative z-1">
				<ul className="my-4 space-y-2">
					{data.features.map((feature, index) => (
						<motion.li
							key={feature}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.2, delay: index * 0.05 }}
							className="flex items-center gap-2"
						>
							<MedalIcon size={16} />
							<span className="whitespace-pre-wrap text-sm">{feature}</span>
						</motion.li>
					))}
				</ul>

				<div className="flex w-full justify-end">
					<Link to="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
						{data.cta}
						<motion.span whileHover={{ rotate: 180, transition: { duration: 0.3 } }}>
							<ArrowRightIcon size={16} />
						</motion.span>
					</Link>
				</div>
			</div>

			<div className="absolute top-0 right-0 z-0 aspect-square h-[140%] translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-100" />
		</motion.div>
	);
}

function PremiumCard({ data }: { data: typeof DATA.pricing.premium }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.34, 1.3, 0.64, 1] } }}
			className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary-300 p-6 shadow-sm"
		>
			{/* Top */}
			<div className="relative z-2">
				<h3 className="font-medium text-base text-white">{data.label}</h3>
				<p className="font-bold text-2xl text-secondary-200 min-[426px]:text-4xl">
					{data.price}
					<span className="ml-1 font-normal text-sm text-white">{data.suffix}</span>
				</p>
			</div>

			{/* Bottom */}
			<div className="relative z-1">
				<ul className="my-4 space-y-2 *:text-white">
					{data.features.map((feature, index) => (
						<motion.li
							key={feature}
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.2, delay: index * 0.05 }}
							className="flex items-center gap-2"
						>
							<MedalIcon size={16} />
							<span className="whitespace-pre-wrap text-sm">{feature}</span>
						</motion.li>
					))}
				</ul>

				<div className="flex w-full justify-end">
					<Link to="/premium" className={cn(buttonVariants({ size: "sm", variant: "default" }), "w-full")}>
						{data.cta}
						<motion.span whileHover={{ rotate: 180, transition: { duration: 0.3 } }}>
							<ArrowRightIcon size={16} />
						</motion.span>
					</Link>
				</div>
			</div>

			<Image
				src="/avatar/premium-pricing-card-avatar.webp"
				alt="Subtest Header Avatar"
				width={530}
				height={530}
				className="absolute right-5 bottom-11.5 z-1 hidden h-[50%] w-auto sm:bottom-9.25 sm:h-[80%] lg:bottom-10.5 lg:h-[60%] min-[426px]:block"
			/>

			<div className="absolute right-0 bottom-0 z-0 aspect-square h-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-primary-200" />
		</motion.div>
	);
}
