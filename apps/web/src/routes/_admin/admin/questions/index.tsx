import { Funnel, MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/questions/")({
	component: QuestionsPage,
});

function QuestionsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filter, setFilter] = useState<"all" | "unused">("all");
	const [page, setPage] = useState(1);
	const limit = 5;
	const offset = (page - 1) * limit;

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPage(1); // Reset to page 1 when search changes
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data, isLoading } = useQuery(
		orpc.admin.practicePack.listAllQuestions.queryOptions({
			input: {
				limit,
				offset,
				unusedOnly: filter === "unused",
				search: debouncedSearch,
			},
		}),
	);

	const questions = data?.data || [];
	const total = data?.total || 0;
	const totalPages = Math.ceil(total / limit);

	return (
		<main className="flex-1 bg-background p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-4 flex items-center justify-between sm:mb-6">
					<div>
						<h1 className="font-bold text-2xl sm:text-3xl">Questions Bank</h1>
						<p className="mt-1 text-muted-foreground text-sm">Manage all questions across practice packs</p>
					</div>
				</div>

				<div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row">
					<div className="relative flex-1">
						<MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search questions..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="w-full sm:w-auto">
								<Funnel className="mr-2 size-4" />
								<span className="hidden sm:inline">{filter === "all" ? "All Questions" : "Unused Only"}</span>
								<span className="sm:hidden">{filter === "all" ? "All" : "Unused"}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuRadioGroup
								value={filter}
								onValueChange={(value) => {
									setFilter(value as "all" | "unused");
									setPage(1);
								}}
							>
								<DropdownMenuRadioItem value="all">All Questions</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="unused">Unused Only</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
				) : !questions || questions.length === 0 ? (
					<Card className="rounded-xl shadow-sm">
						<CardContent className="py-12 text-center">
							<p className="text-muted-foreground text-sm">
								{searchQuery
									? "No questions found matching your search."
									: "No questions yet. Create questions from practice packs."}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{questions.map((question) => (
							<QuestionCard key={question.id} question={question} />
						))}
					</div>
				)}

				{/* Pagination Controls */}
				{totalPages > 1 && (
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
			</div>
		</main>
	);
}

function QuestionCard({
	question,
}: {
	question: {
		id: number;
		content: string;
		discussion: string;
		packCount: number;
	};
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const deleteMutation = useMutation(
		orpc.admin.practicePack.deleteQuestion.mutationOptions({
			onSuccess: () => {
				toast.success("Question deleted successfully");
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] ===
						orpc.admin.practicePack.listAllQuestions.queryKey({
							input: { limit: 0, offset: 0 },
						})[0],
				});
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to delete question", {
					description: String(error),
				});
			},
		}),
	);

	const handleDelete = () => {
		deleteMutation.mutate({ id: question.id });
	};

	return (
		<>
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
						<div className="flex-1">
							<CardTitle className="text-base leading-snug sm:text-lg">{question.content}</CardTitle>
							<p className="mt-2 line-clamp-2 text-muted-foreground text-xs sm:text-sm">{question.discussion}</p>
						</div>
						<div className="flex items-center gap-2">
							{question.packCount > 0 ? (
								<span className="whitespace-nowrap rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs sm:px-3">
									Used in {question.packCount} pack
									{question.packCount !== 1 ? "s" : ""}
								</span>
							) : (
								<span className="whitespace-nowrap rounded bg-muted px-2 py-1 text-muted-foreground text-xs sm:px-3">
									Unused
								</span>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="flex-1 text-xs sm:flex-none sm:text-sm"
							onClick={() => {
								navigate({
									to: "/admin/questions/$id",
									params: { id: question.id.toString() },
								});
							}}
						>
							<PencilSimple className="size-3.5 sm:mr-2 sm:size-4" />
							<span className="hidden sm:inline">Edit</span>
						</Button>
						<Button
							variant="destructive"
							size="sm"
							className="flex-1 text-xs sm:flex-none sm:text-sm"
							onClick={() => setDeleteDialogOpen(true)}
						>
							<Trash className="size-3.5 sm:mr-2 sm:size-4" />
							<span className="hidden sm:inline">Delete</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Question?</AlertDialogTitle>
						<AlertDialogDescription>
							{question.packCount > 0 ? (
								<>
									This question is currently used in{" "}
									<span className="font-semibold">
										{question.packCount} practice pack
										{question.packCount !== 1 ? "s" : ""}
									</span>
									. Deleting it will remove it from all packs. This action cannot be undone.
								</>
							) : (
								"This will permanently delete this question. This action cannot be undone."
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
