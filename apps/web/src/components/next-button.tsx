import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function NextButton({ to, className }: { to: string; className?: string }) {
	return (
		<Link
			to={to}
			className={cn(
				buttonVariants({ variant: "lightBlue", size: "sm" }),
				"gap-2 px-3.5 py-2 text-white text-xs shadow-xs",
				className,
			)}
		>
			Selanjutnya
			<ArrowRightIcon size={20} weight="bold" />
		</Link>
	);
}
