"use client";

import { useInView as useFramerInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function useInView(options = {}) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useFramerInView(ref, {
		once: true,
		amount: 0.1,
		...options,
	});

	return [ref, isInView] as const;
}

export function useAnimatedCounter(
	endValue: number,
	duration = 1500,
	delay = 0,
): { ref: React.RefObject<HTMLSpanElement>; value: number } {
	const [value, setValue] = useState(0);
	const ref = useRef<HTMLSpanElement>(null);
	const [hasStarted, setHasStarted] = useState(false);
	const [_inViewRef, isInView] = useInView();

	useEffect(() => {
		if (isInView && !hasStarted) {
			setHasStarted(true);
		}
	}, [isInView, hasStarted]);

	useEffect(() => {
		if (!hasStarted) return;

		const startTime = Date.now();
		let animationFrame: number;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easeOut = 1 - (1 - progress) ** 3;
			setValue(Math.floor(endValue * easeOut));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		const timeoutId = setTimeout(() => {
			animationFrame = requestAnimationFrame(animate);
		}, delay);

		return () => {
			clearTimeout(timeoutId);
			cancelAnimationFrame(animationFrame);
		};
	}, [hasStarted, endValue, duration, delay]);

	return { ref: ref as React.RefObject<HTMLSpanElement>, value };
}
