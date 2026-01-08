import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

const answerCodes = ["A", "B", "C", "D"] as const;

interface CreateQuestionFormProps {
	practicePackId: number;
	onSuccess?: () => void;
	onCancel?: () => void;
}

const formValidator = type({
	content: "string>0",
	discussion: "string>0",
	answers: type({
		A: { content: "string>0", isCorrect: "boolean" },
		B: { content: "string>0", isCorrect: "boolean" },
		C: { content: "string>0", isCorrect: "boolean" },
		D: { content: "string>0", isCorrect: "boolean" },
	}),
});

export function CreateQuestionForm({ practicePackId, onSuccess, onCancel }: CreateQuestionFormProps) {
	const queryClient = useQueryClient();

	const createQuestionMutation = useMutation(orpc.admin.practicePack.createQuestion.mutationOptions());

	const createAnswerMutation = useMutation(orpc.admin.practicePack.createAnswerOption.mutationOptions());

	const addToPackMutation = useMutation(orpc.admin.practicePack.addQuestionToPack.mutationOptions());

	const form = useForm({
		defaultValues: {
			content: "",
			discussion: "",
			answers: {
				A: { content: "", isCorrect: false },
				B: { content: "", isCorrect: false },
				C: { content: "", isCorrect: false },
				D: { content: "", isCorrect: false },
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
				const question = await createQuestionMutation.mutateAsync({
					content: value.content,
					discussion: value.discussion,
				});

				await Promise.all(
					answerCodes.map((code) =>
						createAnswerMutation.mutateAsync({
							questionId: question.id,
							code,
							content: value.answers[code].content,
							isCorrect: value.answers[code].isCorrect,
						}),
					),
				);

				await addToPackMutation.mutateAsync({
					practicePackId,
					questionId: question.id,
					order: 1,
				});

				toast.success("Question created successfully");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getPackQuestions.queryOptions({ input: { id: practicePackId } }),
				);
				form.reset();
				onSuccess?.();
			} catch (error) {
				toast.error("Failed to create question", {
					description: String(error),
				});
			}
		},
	});

	const isSubmitting =
		createQuestionMutation.isPending || createAnswerMutation.isPending || addToPackMutation.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New Question</CardTitle>
			</CardHeader>
			<CardContent>
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
									Creating...
								</>
							) : (
								"Create Question"
							)}
						</Button>
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
