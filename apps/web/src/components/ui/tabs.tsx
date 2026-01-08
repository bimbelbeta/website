import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List data-slot="tabs-list" className={cn("flex w-full gap-3 md:w-fit", className)} {...props} />
	);
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-primary-300 px-[14px] py-[8px] font-normal text-xs shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-[37px] md:flex-none",
				"bg-white text-primary-300",
				"data-[state=active]:bg-primary-300 data-[state=active]:text-white",
				"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
