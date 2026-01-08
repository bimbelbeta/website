import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const UserProgress = () => {
	return (
		<section className="">
			<h2 className="mb-2 font-medium">Progres Kamu!</h2>
			<div className="grid gap-2 sm:grid-cols-5">
				<div className="space-y-2 sm:col-span-2">
					<Material />
					<Tryout />
				</div>
			</div>
		</section>
	);
};

const Material = () => {
	const { data, isPending } = useQuery(orpc.subtest.getProgressStats.queryOptions());

	return (
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-blue-200 p-4 text-primary">
			<div className="z-10 space-y-0.5">
				<h4 className={`font-bold text-4xl sm:text-5xl ${isPending && "animate-pulse"}`}>
					{!isPending ? (data?.materialsCompleted ?? 0) : "..."}
				</h4>
				<p className="font-bold">Materi Dipelajari</p>
			</div>

			<Button size="icon" className="z-10" asChild>
				<Link to="/classes">
					<ArrowRightIcon weight="bold" />
				</Link>
			</Button>

			<div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-blue-300" />
		</div>
	);
};

const Tryout = () => {
	return (
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-green-200 p-4 text-green-800">
			<div className="z-10 space-y-0.5">
				<h2 className="font-bold text-2xl">Kerjakan Tryout</h2>
			</div>

			<Button asChild size="icon" variant="secondary" className="z-10">
				<a href="https://youtube.com">
					<ArrowRightIcon />
				</a>
			</Button>

			<div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-green-300" />
		</div>
	);
};
