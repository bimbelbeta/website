import { ArrowLeftIcon, CaretLeftIcon, CaretRightIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { AddExistingQuestionModal } from "./-components/add-existing-modal";
import { CreateQuestionForm } from "./-components/create-question-form";
import { EditPackForm } from "./-components/edit-pack-form";

export const Route = createFileRoute("/_admin/admin/practice-packs/$id")({
	component: PracticePackDetailPage,
});

function PracticePackDetailPage() {
	const { id } = Route.useParams();
	const packId = Number.parseInt(id, 10);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showAddExisting, setShowAddExisting] = useState(false);

	const { data } = useQuery(
		orpc.admin.practicePack.getPackQuestions.queryOptions({
			input: { id: packId },
		}),
	);

	const existingQuestionIds = data?.questions?.map((q) => q.id) || [];

	if (Number.isNaN(packId)) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<p className="text-destructive">Invalid practice pack ID</p>
			</main>
		);
	}

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-4 flex items-center gap-4 sm:mb-6">
					<Button variant="ghost" size="icon" asChild>
						<a href="/admin/practice-packs">
							<ArrowLeftIcon className="size-4" />
						</a>
					</Button>
					<h1 className="font-bold text-2xl sm:text-3xl">Practice Pack Detail</h1>
				</div>

				<div className="space-y-4 sm:space-y-6">
					<PackInfoCard packId={packId} />

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="font-semibold text-xl sm:text-2xl">Questions</h2>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button onClick={() => setShowAddExisting(true)} variant="outline" className="text-xs sm:text-sm">
								<MagnifyingGlassIcon className="mr-2 size-3.5 sm:size-4" />
								Add Existing
							</Button>
							<Button onClick={() => setShowCreateForm(true)} className="text-xs sm:text-sm">
								<PlusIcon className="mr-2 size-3.5 sm:size-4" />
								Create New Question
							</Button>
						</div>
					</div>

					{showAddExisting && (
						<AddExistingQuestionModal
							practicePackId={packId}
							existingQuestionIds={existingQuestionIds}
							onClose={() => setShowAddExisting(false)}
						/>
					)}

					{showCreateForm && (
						<CreateQuestionForm
							practicePackId={packId}
							onSuccess={() => setShowCreateForm(false)}
							onCancel={() => setShowCreateForm(false)}
						/>
					)}

					<QuestionsList packId={packId} />
				</div>
			</div>
		</main>
	);
}

function PackInfoCard({ packId }: { packId: number }) {
	const [isEditing, setIsEditing] = useState(false);
	const { data: pack, isLoading } = useQuery(
		orpc.admin.practicePack.getPack.queryOptions({
			input: { id: packId },
		}),
	);

	if (isLoading) {
		return (
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<CardTitle className="text-lg sm:text-xl">Pack Information</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					<div className="space-y-4">
						<Skeleton className="h-8 w-2/3" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!pack) {
		return (
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<CardTitle className="text-lg sm:text-xl">Pack Information</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					<p className="text-destructive">Practice pack not found</p>
				</CardContent>
			</Card>
		);
	}

	if (isEditing) {
		return (
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<CardTitle className="text-lg sm:text-xl">Edit Pack Information</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					<EditPackForm pack={pack} onSuccess={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="rounded-xl shadow-sm">
			<CardHeader className="p-4 sm:p-6">
				<CardTitle className="text-lg sm:text-xl">Pack Information</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
				<div className="space-y-4">
					<div>
						<h3 className="font-semibold text-lg">{pack.title}</h3>
						{pack.description && <p className="mt-2 text-muted-foreground text-sm">{pack.description}</p>}
					</div>
					<Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
						Edit Pack Info
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function QuestionsList({ packId }: { packId: number }) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [gridPage, setGridPage] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const GRID_SIZE = 30;
	const navigate = useNavigate();

	const { data, isLoading } = useQuery(
		orpc.admin.practicePack.getPackQuestions.queryOptions({
			input: { id: packId },
		}),
	);

	const allQuestions = data?.questions || [];

	// Filter questions based on search query
	const questions = searchQuery
		? allQuestions.filter((q) => q.content.toLowerCase().includes(searchQuery.toLowerCase()))
		: allQuestions;

	useEffect(() => {
		if (questions && questions.length > 0) {
			setCurrentQuestionIndex(0);
			setGridPage(0);
		}
	}, [questions]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!questions || questions.length === 0) return;

			if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
				const newIndex = currentQuestionIndex - 1;
				setCurrentQuestionIndex(newIndex);
				setGridPage(Math.floor(newIndex / GRID_SIZE));
			} else if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
				const newIndex = currentQuestionIndex + 1;
				setCurrentQuestionIndex(newIndex);
				setGridPage(Math.floor(newIndex / GRID_SIZE));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentQuestionIndex, questions]);

	const handleQuestionClick = (index: number) => {
		setCurrentQuestionIndex(index);
		setGridPage(Math.floor(index / GRID_SIZE));
	};

	if (isLoading) {
		return (
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<CardTitle className="text-lg sm:text-xl">Questions in this Pack</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					<div className="space-y-3">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<Card className="rounded-xl shadow-sm">
				<CardHeader className="p-4 sm:p-6">
					<CardTitle className="text-lg sm:text-xl">Questions in this Pack</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
					{allQuestions.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No questions yet. Create a new question or add an existing one.
						</p>
					) : (
						<div className="space-y-4">
							<div className="relative">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search questions..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>
							<p className="text-muted-foreground text-sm">No questions found matching "{searchQuery}".</p>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const totalGridPages = Math.ceil(questions.length / GRID_SIZE);
	const startIndex = gridPage * GRID_SIZE;
	const endIndex = Math.min(startIndex + GRID_SIZE, questions.length);
	const visibleQuestions = questions.slice(startIndex, endIndex);

	if (!currentQuestion) return null;

	return (
		<div className="space-y-4">
			{/* Search Input */}
			{allQuestions.length > 0 && (
				<div className="relative">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search questions..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			)}

			<div className="flex flex-col gap-4 lg:flex-row">
				<div className="flex-1 lg:order-1">
					<Card className="rounded-xl shadow-sm">
						<CardHeader className="p-4 sm:p-6">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg sm:text-xl">
									Question {currentQuestionIndex + 1} of {questions.length}
								</CardTitle>
								<span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs sm:px-3 sm:text-sm">
									#{currentQuestion?.order || currentQuestionIndex + 1}
								</span>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
							<div>
								<h4 className="mb-2 font-semibold text-base sm:text-lg">Question:</h4>
								<p className="text-sm leading-relaxed sm:text-base">{currentQuestion?.content}</p>
							</div>

							<div>
								<h4 className="mb-2 font-semibold text-base sm:text-lg">Answer Options:</h4>
								<div className="space-y-2">
									{currentQuestion?.answers?.map((answer) => (
										<div
											key={answer.id}
											className={cn(
												"flex items-start gap-3 rounded-md border p-3 sm:p-4",
												answer.isCorrect && "border-tertiary bg-tertiary/5",
											)}
										>
											<span
												className={cn(
													"flex size-6 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
													answer.isCorrect ? "bg-tertiary text-white" : "bg-muted text-muted-foreground",
												)}
											>
												{answer.code}
											</span>
											<p className="flex-1 text-sm leading-relaxed sm:text-base">{answer.content}</p>
											{answer.isCorrect && (
												<span className="shrink-0 rounded bg-tertiary px-2 py-0.5 font-medium text-white text-xs">
													Correct
												</span>
											)}
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="mb-2 font-semibold text-base sm:text-lg">Discussion:</h4>
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
									{currentQuestion?.discussion}
								</p>
							</div>

							<div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:gap-3">
								<Button
									variant="outline"
									className="w-full text-xs sm:w-auto sm:text-sm"
									onClick={() => {
										navigate({
											to: "/admin/questions/$id",
											params: { id: currentQuestion.id.toString() },
										});
									}}
								>
									Edit Question
								</Button>
								<RemoveQuestionButton packId={packId} question={currentQuestion} />
							</div>

							<div className="flex items-center justify-between border-t pt-4">
								<Button
									variant="outline"
									size="sm"
									className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
									onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
									disabled={currentQuestionIndex === 0}
								>
									<CaretLeftIcon className="mr-1 size-3.5 sm:size-4" />
									<span className="hidden sm:inline">Previous</span>
									<span className="sm:hidden">Prev</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
									onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
									disabled={currentQuestionIndex === questions.length - 1}
								>
									<span className="hidden sm:inline">Next</span>
									<span className="sm:hidden">Next</span>
									<CaretRightIcon className="ml-1 size-3.5 sm:size-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:order-2 lg:w-64">
					<Card className="rounded-xl shadow-sm">
						<CardHeader className="p-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base sm:text-lg">Navigate</CardTitle>
								{totalGridPages > 1 && (
									<span className="text-muted-foreground text-xs">
										{gridPage + 1}/{totalGridPages}
									</span>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-3 p-4 pt-0">
							<div className="grid grid-cols-5 gap-1.5 sm:gap-2 lg:grid-cols-4">
								{visibleQuestions.map((question, idx) => {
									const absoluteIndex = startIndex + idx;
									return (
										<Button
											key={question.id}
											variant={absoluteIndex === currentQuestionIndex ? "default" : "outline"}
											className={cn(
												"h-8 w-full p-0 text-xs sm:h-9 sm:text-sm",
												absoluteIndex === currentQuestionIndex && "font-semibold",
											)}
											onClick={() => handleQuestionClick(absoluteIndex)}
										>
											{absoluteIndex + 1}
										</Button>
									);
								})}
							</div>

							{totalGridPages > 1 && (
								<div className="flex items-center justify-between border-t pt-3">
									<Button
										variant="ghost"
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => setGridPage(gridPage - 1)}
										disabled={gridPage === 0}
									>
										<CaretLeftIcon className="size-3.5" />
									</Button>
									<span className="text-muted-foreground text-xs">
										{startIndex + 1}-{endIndex} of {questions.length}
									</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => setGridPage(gridPage + 1)}
										disabled={gridPage === totalGridPages - 1}
									>
										<CaretRightIcon className="size-3.5" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function RemoveQuestionButton({
	packId,
	question,
}: {
	packId: number;
	question: {
		id: number;
		content: string;
		discussion: string;
		order: number | null;
	};
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const removeMutation = useMutation(
		orpc.admin.practicePack.removeQuestionFromPack.mutationOptions({
			onSuccess: () => {
				toast.success("Question removed from pack");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getPackQuestions.queryOptions({
						input: { id: packId },
					}),
				);
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to remove question", {
					description: String(error),
				});
			},
		}),
	);

	const handleRemove = () => {
		removeMutation.mutate({ practicePackId: packId, questionId: question.id });
	};

	return (
		<>
			<Button
				variant="destructive"
				className="w-full text-xs sm:w-auto sm:text-sm"
				onClick={() => setDeleteDialogOpen(true)}
			>
				Remove from Pack
			</Button>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Question from Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the question from this practice pack. The question will still exist in the question bank.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemove}
							disabled={removeMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{removeMutation.isPending ? "Removing..." : "Remove"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
