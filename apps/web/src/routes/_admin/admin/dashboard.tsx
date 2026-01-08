import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/dashboard")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { data: stats, isLoading } = useQuery(orpc.admin.practicePack.getStatistics.queryOptions());

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mb-6 sm:mb-8">
				<h1 className="font-bold text-2xl sm:text-3xl">Admin Dashboard</h1>
				<p className="text-muted-foreground text-sm sm:text-base">Selamat datang di panel admin bimbelbeta</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
				<div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
					<h3 className="font-medium text-muted-foreground text-sm">Total Users</h3>
					{isLoading ? (
						<Skeleton className="mt-2 h-10 w-20" />
					) : (
						<p className="font-bold text-2xl sm:text-3xl">{stats?.totalUsers || 0}</p>
					)}
				</div>
				<div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
					<h3 className="font-medium text-muted-foreground text-sm">Practice Packs</h3>
					{isLoading ? (
						<Skeleton className="mt-2 h-10 w-20" />
					) : (
						<p className="font-bold text-2xl sm:text-3xl">{stats?.totalPracticePacks || 0}</p>
					)}
				</div>
				<div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
					<h3 className="font-medium text-muted-foreground text-sm">Total Questions</h3>
					{isLoading ? (
						<Skeleton className="mt-2 h-10 w-20" />
					) : (
						<p className="font-bold text-2xl sm:text-3xl">{stats?.totalQuestions || 0}</p>
					)}
				</div>
			</div>
		</main>
	);
}
