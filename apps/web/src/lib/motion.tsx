import { domAnimation, LazyMotion } from "motion/react";

export function MotionProvider(props: { children: React.ReactNode }) {
	return <LazyMotion features={domAnimation}>{props.children}</LazyMotion>;
}
