import { useMemo } from "react";

const LOADING_TEXTS = [
	"Sharpening pencils...",
	"Brewing coffee for the brain cells...",
	"Summoning the knowledge spirits...",
	"Loading wisdom...",
	"Organizing the library...",
];

export default function Loader() {
	const text = useMemo(() => {
		return LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)];
	}, []);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-8">
			<div className="flex items-center gap-2">
				{[
					{ color: "bg-primary", delay: "delay-0" },
					{ color: "bg-secondary", delay: "delay-150" },
					{ color: "bg-tertiary", delay: "delay-300" },
				].map((dot) => (
					<div
						key={dot.color + dot.delay}
						className={`h-3.5 w-3.5 animate-bounce rounded-full ${dot.color} ${dot.delay}`}
					/>
				))}
			</div>
			<p className="animate-pulse font-medium text-muted-foreground text-sm">{text}</p>
		</div>
	);
}
