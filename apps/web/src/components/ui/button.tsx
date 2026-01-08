import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>Link]:hover:cursor-pointer [&>a]:hover:cursor-pointer [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/80",
				outline: "border-3 bg-white text-muted-foreground hover:bg-accent hover:bg-background/20",
				// Yellow
				secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				// White
				white: "bg-white text-primary-300 shadow-xs hover:bg-white/90",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				navbar:
					"bg-inherit text-foreground hover:bg-primary/5 data-[active=true]:border-primary data-[active=true]:border-b-2 data-[active=true]:bg-primary/10",
				// Light Blue
				lightBlue: "bg-primary-300 text-white shadow-xs hover:bg-primary-300",
			},
			size: {
				default: "h-10 px-6 py-2 has-[>svg]:px-4",
				sm: "h-9 gap-1.5 rounded-md px-6 has-[>svg]:px-4",
				lg: "h-11 rounded-sm px-8 has-[>svg]:px-6",
				full: "h-full rounded-none px-6 py-2",
				icon: "size-9",
				none: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
