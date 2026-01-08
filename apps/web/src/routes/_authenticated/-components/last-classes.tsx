import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const LastClasses = () => {
	const { data, isPending } = useQuery(orpc.subtest.getRecentViews.queryOptions());

	if (isPending) {
		return (
			<section>
				<h2 className="mb-2 font-medium">Kelas terakhirmu</h2>
				<div className="animate-pulse space-y-2">
					<div className="h-32 rounded-md bg-neutral-200" />
					<div className="h-32 rounded-md bg-neutral-200" />
				</div>
			</section>
		);
	}

	if (!data || data.length === 0) {
		return (
			<section>
				<h2 className="font-medium">Kelas terakhirmu</h2>
				<div className="flex flex-col items-center justify-center space-y-6 py-8">
					<img src="/avatar/confused-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto" />
					<p className="font-bold text-2xl text-black">Kamu belum melihat kelas apapun</p>
					<Button asChild>
						<Link to="/classes">
							Kelas Sekarang <ArrowRightIcon className="" />
						</Link>
					</Button>
				</div>
			</section>
		);
	}

	return (
		<section>
			<h2 className="mb-2 font-medium">Kelas terakhirmu</h2>
			<div className="space-y-2">
				{data.map((view, idx) => (
					<LastContentViewedCard
						key={view.contentId}
						item={{
							id: view.contentId,
							title: view.contentTitle,
							hasVideo: Boolean(view.hasVideo),
							hasNote: Boolean(view.hasNote),
							hasPracticeQuestions: Boolean(view.hasPracticeQuestions),
						}}
						index={idx}
						shortName={view.subtestShortName}
					/>
				))}
			</div>
		</section>
	);
};
