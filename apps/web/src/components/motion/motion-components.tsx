import { type HTMLMotionProps, motion } from "motion/react";
import { useInView } from "@/hooks/use-animations";
import {
	bounce,
	fadeInDown,
	fadeInLeft,
	fadeInRight,
	fadeInUp,
	pulse,
	scaleIn,
	staggerChild,
	staggerContainer,
	wiggle,
} from "@/lib/animation-variants";

export function MotionFadeUp({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={fadeInUp}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionFadeDown({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={fadeInDown}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionFadeLeft({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={fadeInLeft}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionFadeRight({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={fadeInRight}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionScaleIn({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={scaleIn}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionFloat({
	children,
	className = "",
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 0 }}
			animate={{ opacity: 1, y: -6 }}
			transition={{ duration: 0.5, ease: "easeOut", delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function MotionBounce({ children, className = "", ...props }: HTMLMotionProps<"button">) {
	return (
		<motion.button variants={bounce} className={className} {...props}>
			{children}
		</motion.button>
	);
}

export function MotionPulse({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	return (
		<motion.div variants={pulse} animate="animate" className={className} {...props}>
			{children}
		</motion.div>
	);
}

export function MotionWiggle({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	return (
		<motion.div variants={wiggle} className={className} {...props}>
			{children}
		</motion.div>
	);
}

export function MotionStagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	const [ref, isInView] = useInView();

	return (
		<motion.div
			ref={ref}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			variants={staggerContainer}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function MotionStaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return (
		<motion.div variants={staggerChild} className={className}>
			{children}
		</motion.div>
	);
}

export function MotionCard({ children, className = "", ...props }: HTMLMotionProps<"div">) {
	return (
		<motion.div
			whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.34, 1.3, 0.64, 1] } }}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function MotionButton({ children, className = "", ...props }: HTMLMotionProps<"button">) {
	return (
		<motion.button
			whileHover={{ scale: 1.05, transition: { duration: 0.4, ease: [0.34, 1.3, 0.64, 1] } }}
			whileTap={{ scale: 0.98 }}
			className={className}
			{...props}
		>
			{children}
		</motion.button>
	);
}
