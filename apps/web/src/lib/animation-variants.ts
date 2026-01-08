import type { Variants } from "motion/react";

const TRANSITION = {
	duration: 0.3,
	ease: [0.25, 0.1, 0.25, 1] as const,
};

const BOUNCE_TRANSITION = {
	duration: 0.4,
	ease: [0.34, 1.3, 0.64, 1] as const,
};

export const fadeInUp: Variants = {
	initial: {
		opacity: 0,
		y: 20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: TRANSITION,
	},
};

export const fadeInDown: Variants = {
	initial: {
		opacity: 0,
		y: -20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: TRANSITION,
	},
};

export const fadeInLeft: Variants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: TRANSITION,
	},
};

export const fadeInRight: Variants = {
	initial: {
		opacity: 0,
		x: 20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: TRANSITION,
	},
};

export const scaleIn: Variants = {
	initial: {
		opacity: 0,
		scale: 0.9,
	},
	animate: {
		opacity: 1,
		scale: 1,
		transition: TRANSITION,
	},
};

export const float: Variants = {
	animate: {
		y: [0, -6],
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
};

export const bounce: Variants = {
	whileHover: {
		scale: 1.05,
		transition: BOUNCE_TRANSITION,
	},
	whileTap: {
		scale: 0.98,
	},
};

export const pulse: Variants = {
	animate: {
		scale: [1, 1.05, 1],
		transition: {
			duration: 5,
			ease: "easeInOut",
			repeat: Number.POSITIVE_INFINITY,
		},
	},
};

export const wiggle: Variants = {
	whileHover: {
		rotate: [0, -2, 2, -2, 2, 0],
		transition: {
			duration: 0.4,
			ease: "easeInOut",
		},
	},
};

export const staggerContainer: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export const staggerChild: Variants = {
	initial: {
		opacity: 0,
		y: 15,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: TRANSITION,
	},
};

export const buttonHover = {
	whileHover: {
		scale: 1.05,
		transition: BOUNCE_TRANSITION,
	},
	whileTap: {
		scale: 0.98,
	},
};

export const cardHover = {
	whileHover: {
		y: -4,
		transition: BOUNCE_TRANSITION,
	},
};
