import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubtestCard, SubtestHeader } from "@/components/classes";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const session = authClient.useSession();
	const userIsPremium = session.data?.user?.isPremium ?? false;
	const userRole = session.data?.user?.role;
	const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());

	return (
		<div className="mt-4 sm:-mt-3">
			<SubtestHeader />

			<hr className="my-3 sm:my-4" />

			<div>
				{subtests.isPending && (
					<div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 9 }).map((_, i) => (
							<Skeleton key={i.toString()} className="h-40 w-full" />
						))}
					</div>
				)}

				{subtests.isError && <p className="text-red-500">Error: {subtests.error.message}</p>}

				{subtests.data && subtests.data.length === 0 && <p className="text-muted-foreground">No subtests yet</p>}

				{subtests.data && subtests.data.length > 0 && (
					<div className="grid h-full grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
						{subtests.data.map((subtest) => (
							<SubtestCard key={subtest.id} subtest={subtest} userIsPremium={userIsPremium} userRole={userRole} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
