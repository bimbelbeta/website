import { ArrowLeft } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/questions/$id")({
	component: QuestionEditPage,
});

const answerCodes = ["A", "B", "C", "D"] as const;

const formValidator = type({
	content: "string>0",
	discussion: "string>0",
	answers: type({
		A: { id: "number", content: "string>0", isCorrect: "boolean" },
		B: { id: "number", content: "string>0", isCorrect: "boolean" },
		C: { id: "number", content: "string>0", isCorrect: "boolean" },
		D: { id: "number", content: "string>0", isCorrect: "boolean" },
	}),
});

function QuestionEditPage() {
	const { id } = Route.useParams();
	const questionId = Number.parseInt(id, 10);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [initializedQuestionId, setInitializedQuestionId] = useState<number | null>(null);

	const { data: question, isLoading } = useQuery(
		orpc.admin.practicePack.getQuestionDetail.queryOptions({
			input: { id: questionId },
		}),
	);

	const updateQuestionMutation = useMutation(orpc.admin.practicePack.updateQuestion.mutationOptions());

	const updateAnswerMutation = useMutation(orpc.admin.practicePack.updateAnswerOption.mutationOptions());

	const form = useForm({
		defaultValues: {
			content: "",
			discussion: "",
			answers: {
				A: {
					id: 0,
					content: "",
					isCorrect: false,
				},
				B: {
					id: 0,
					content: "",
					isCorrect: false,
				},
				C: {
					id: 0,
					content: "",
					isCorrect: false,
				},
				D: {
					id: 0,
					content: "",
					isCorrect: false,
				},
			},
		},
		onSubmit: async ({ value }) => {
			const validation = formValidator(value);
			if (validation instanceof type.errors) {
				toast.error("Please fill all required fields");
				return;
			}

			const hasCorrectAnswer = Object.values(value.answers).some((a) => a.isCorrect);
			if (!hasCorrectAnswer) {
				toast.error("Please mark at least one answer as correct");
				return;
			}

			try {
				await updateQuestionMutation.mutateAsync({
					id: questionId,
					content: value.content,
					discussion: value.discussion,
				});

				await Promise.all(
					answerCodes.map((code) =>
						updateAnswerMutation.mutateAsync({
							id: value.answers[code].id,
							content: value.answers[code].content,
							isCorrect: value.answers[code].isCorrect,
						}),
					),
				);

				toast.success("Question updated successfully");

				queryClient.invalidateQueries(
					orpc.admin.practicePack.getQuestionDetail.queryOptions({
						input: { id: questionId },
					}),
				);
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] ===
						orpc.admin.practicePack.listAllQuestions.queryKey({ input: { limit: 0, offset: 0 } })[0],
				});

				setTimeout(() => {
					navigate({ to: "/admin/questions" });
				}, 500);
			} catch (error) {
				toast.error("Failed to update question", {
					description: String(error),
				});
			}
		},
	});

	// Reset initialization state when navigating to a different question
	useEffect(() => {
		setInitializedQuestionId(null);
	}, []);

	// Initialize form values when question data is loaded
	useEffect(() => {
		if (question && question.id !== initializedQuestionId) {
			const answersMap = question.answers.reduce(
				(acc, ans) => {
					acc[ans.code as keyof typeof acc] = ans;
					return acc;
				},
				{} as Record<(typeof answerCodes)[number], (typeof question.answers)[number]>,
			);

			form.setFieldValue("content", question.content);
			form.setFieldValue("discussion", question.discussion);
			answerCodes.forEach((code) => {
				const answer = answersMap[code];
				if (answer) {
					form.setFieldValue(`answers.${code}.id`, answer.id);
					form.setFieldValue(`answers.${code}.content`, answer.content);
					form.setFieldValue(`answers.${code}.isCorrect`, answer.isCorrect);
				}
			});

			setInitializedQuestionId(question.id);
		}
		// The form object from useForm is a stable reference and doesn't change between renders.
		// Including it in the dependency array would not provide any benefit and is intentionally omitted.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [question, initializedQuestionId, form.setFieldValue]);

	if (Number.isNaN(questionId)) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<p className="text-destructive">Invalid question ID</p>
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<div className="mx-auto max-w-4xl">
					<Skeleton className="mb-6 h-10 w-64" />
					<Skeleton className="h-96 w-full" />
				</div>
			</main>
		);
	}

	if (!question) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-6 flex items-center gap-4">
						<a href="/admin/questions">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="size-4" />
							</Button>
						</a>
						<h1 className="font-bold text-2xl sm:text-3xl">Edit Question</h1>
					</div>
					<p className="text-destructive">Question not found</p>
				</div>
			</main>
		);
	}

	const isSubmitting = updateQuestionMutation.isPending || updateAnswerMutation.isPending;

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-4 flex items-center gap-4 sm:mb-6">
					<a href="/admin/questions">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="size-4" />
						</Button>
					</a>
					<h1 className="font-bold text-2xl sm:text-3xl">Edit Question</h1>
				</div>

				<Card className="rounded-xl shadow-sm">
					<CardHeader className="p-4 sm:p-6">
						<CardTitle className="text-lg sm:text-xl">Question Details</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<form.Field name="content">
								{(field) => (
									<div>
										<Label htmlFor="content">Question Content *</Label>
										<Input
											id="content"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter the question"
											className="mt-2"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="discussion">
								{(field) => (
									<div>
										<Label htmlFor="discussion">Discussion / Explanation *</Label>
										<Input
											id="discussion"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Explain the answer"
											className="mt-2"
										/>
									</div>
								)}
							</form.Field>

							<div>
								<h3 className="mb-4 font-medium">Answer Options *</h3>
								<div className="space-y-3">
									{answerCodes.map((code) => (
										<div key={code} className="flex items-start gap-3">
											<div className="mt-2 flex items-center gap-2">
												<span className="font-medium text-sm">{code}.</span>
												<form.Field name={`answers.${code}.isCorrect`}>
													{(field) => (
														<Checkbox
															checked={field.state.value}
															onCheckedChange={(checked) => field.handleChange(!!checked)}
														/>
													)}
												</form.Field>
											</div>
											<form.Field name={`answers.${code}.content`}>
												{(field) => (
													<Input
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder={`Option ${code}`}
														className="flex-1"
													/>
												)}
											</form.Field>
										</div>
									))}
								</div>
								<p className="mt-2 text-muted-foreground text-xs">Check the box to mark as correct answer</p>
							</div>

							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting} className="flex-1">
									{isSubmitting ? (
										<>
											<Loader />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										window.location.href = "/admin/questions";
									}}
								>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
