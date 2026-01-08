import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

interface AddExistingQuestionModalProps {
	practicePackId: number;
	existingQuestionIds: number[];
	onClose: () => void;
}

export function AddExistingQuestionModal({
	practicePackId,
	existingQuestionIds,
	onClose,
}: AddExistingQuestionModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const queryClient = useQueryClient();

	const { data: allQuestions, isLoading } = useQuery(
		orpc.admin.practicePack.listAllQuestions.queryOptions({
			input: { limit: 1000, offset: 0 },
		}),
	);

	const { data: packQuestions } = useQuery(
		orpc.admin.practicePack.getPackQuestions.queryOptions({
			input: { id: practicePackId },
		}),
	);

	const addMutation = useMutation(
		orpc.admin.practicePack.addQuestionToPack.mutationOptions({
			onSuccess: () => {
				toast.success("Question added to pack");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getPackQuestions.queryOptions({
						input: { id: practicePackId },
					}),
				);
			},
			onError: (error) => {
				toast.error("Failed to add question", {
					description: String(error),
				});
			},
		}),
	);

	const availableQuestions = allQuestions?.data.filter((q) => !existingQuestionIds.includes(q.id));

	const filteredQuestions = availableQuestions?.filter((q) =>
		q.content.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleAddQuestion = (questionId: number) => {
		const nextOrder = (packQuestions?.questions.length || 0) + 1;
		addMutation.mutate({
			practicePackId,
			questionId,
			order: nextOrder,
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Add Existing Question</CardTitle>
						<CardDescription>Search and add questions from your question bank</CardDescription>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="size-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="relative">
					<MagnifyingGlass className="absolute top-3 left-3 size-4 text-muted-foreground" />
					<Input
						placeholder="Search questions..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="max-h-96 space-y-2 overflow-y-auto">
					{isLoading ? (
						<>
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</>
					) : filteredQuestions && filteredQuestions.length > 0 ? (
						filteredQuestions.map((q) => (
							<div key={q.id} className="flex items-start gap-3 rounded-lg border p-4">
								<div className="flex-1">
									<p className="font-medium">{q.content}</p>
									<p className="line-clamp-1 text-muted-foreground text-sm">{q.discussion}</p>
								</div>
								<Button size="sm" onClick={() => handleAddQuestion(q.id)} disabled={addMutation.isPending}>
									Add
								</Button>
							</div>
						))
					) : (
						<div className="py-8 text-center text-muted-foreground">
							{searchQuery
								? "No questions found matching your search"
								: "No available questions. All questions are already in this pack or create new questions first."}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
