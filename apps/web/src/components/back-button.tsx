import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function BackButton({ to }: { to: string }) {
	return (
		<Link
			to={to}
			className={cn(
				buttonVariants({ variant: "lightBlue", size: "sm" }),
				"gap-2 px-3.5 py-2 text-white text-xs shadow-xs",
			)}
		>
			<ArrowLeftIcon size={20} weight="bold" />
			Kembali
		</Link>
	);
}
