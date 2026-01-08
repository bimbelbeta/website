import { Package, Plus, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/practice-packs/")({
	component: PracticePacksListPage,
});

function PracticePacksListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const limit = 9;
	const offset = (page - 1) * limit;

	const { data, isPending, isError, error } = useQuery(
		orpc.admin.practicePack.listPacks.queryOptions({ input: { limit, offset } }),
	);

	const packs = data?.data || [];
	const total = data?.total || 0;
	const totalPages = Math.ceil(total / limit);

	const filteredPacks = packs.filter((pack) => pack.title.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl sm:text-3xl">Practice Packs</h1>
					<p className="text-muted-foreground">Kelola paket latihan soal</p>
				</div>

				<Button asChild>
					<Link to="/admin/practice-packs/create">
						<Plus className="size-4" />
						<span className="hidden sm:inline">Create New Pack</span>
						<span className="sm:hidden">Create</span>
					</Link>
				</Button>
			</div>

			<div className="mb-4 sm:mb-6">
				<Input
					placeholder="Search practice packs..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full sm:max-w-md"
				/>
			</div>

			{isPending && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="p-6">
							<Skeleton className="mb-4 h-6 w-3/4" />
							<Skeleton className="mb-4 h-4 w-full" />
							<Skeleton className="h-10 w-full" />
						</Card>
					))}
				</div>
			)}

			{isError && (
				<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
					<p className="text-destructive">Error: {error.message}</p>
				</div>
			)}

			{filteredPacks && filteredPacks.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
					<Package className="mb-4 size-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No practice packs found</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						{searchQuery ? "Try adjusting your search query" : "Get started by creating a new practice pack"}
					</p>
					{!searchQuery && (
						<Button asChild>
							<Link to="/admin/practice-packs/create">
								<Plus />
								Create First Pack
							</Link>
						</Button>
					)}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filteredPacks?.map((pack) => (
					<PracticePackCard key={pack.id} pack={pack} />
				))}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && !searchQuery && (
				<div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:mt-8 sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
						className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
					>
						<span className="hidden sm:inline">Previous</span>
						<span className="sm:hidden">Prev</span>
					</Button>

					<div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1">
						{page > 3 && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(1)}
									className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
								>
									1
								</Button>
								{page > 4 && <span className="hidden px-1 text-xs sm:inline sm:px-2">...</span>}
							</>
						)}

						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter((pageNum) => {
								return (
									pageNum === page ||
									pageNum === page - 1 ||
									pageNum === page + 1 ||
									pageNum === page - 2 ||
									pageNum === page + 2
								);
							})
							.map((pageNum) => (
								<Button
									key={pageNum}
									variant={pageNum === page ? "default" : "outline"}
									size="sm"
									onClick={() => setPage(pageNum)}
									className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
								>
									{pageNum}
								</Button>
							))}

						{page < totalPages - 2 && (
							<>
								{page < totalPages - 3 && <span className="hidden px-1 text-xs sm:inline sm:px-2">...</span>}
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(totalPages)}
									className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
								>
									{totalPages}
								</Button>
							</>
						)}
					</div>

					<Button
						variant="outline"
						size="sm"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
						className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
					>
						<span className="hidden sm:inline">Next</span>
						<span className="sm:hidden">Next</span>
					</Button>
				</div>
			)}
		</main>
	);
}

function PracticePackCard({ pack }: { pack: { id: number; title: string; description: string | null } }) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation(
		orpc.admin.practicePack.deletePack.mutationOptions({
			onSuccess: () => {
				toast.success("Practice pack berhasil dihapus");
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] ===
						orpc.admin.practicePack.listPacks.queryKey({
							input: { limit: 0, offset: 0 },
						})[0],
				});
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Gagal menghapus practice pack", {
					description: error.message,
				});
			},
		}),
	);

	const handleDelete = () => {
		deleteMutation.mutate({ id: pack.id });
	};

	return (
		<>
			<Card className="group flex cursor-pointer flex-col rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
				<a href={`/admin/practice-packs/${pack.id}`} className="flex-1">
					<div className="mb-4">
						<h3 className="mb-2 font-semibold text-lg group-hover:text-primary">{pack.title}</h3>
						<p className="line-clamp-2 text-muted-foreground text-sm">{pack.description || "No description"}</p>
					</div>
				</a>

				<div className="flex gap-2">
					<Button
						variant="destructive"
						size="sm"
						className="flex-1 text-xs sm:text-sm"
						onClick={() => setDeleteDialogOpen(true)}
					>
						<Trash className="size-3.5 sm:size-4" />
						<span className="hidden sm:inline">Delete</span>
					</Button>
				</div>
			</Card>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Practice Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{pack.title}"? This action cannot be undone and will remove all
							associated questions.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
								{deleteMutation.isPending ? "Deleting..." : "Delete"}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
