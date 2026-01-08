import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/latihan-soal/$id")({
	params: {
		parse: (rawParams) => {
			const id = Number(rawParams.id);
			return { id };
		},
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const pack = useQuery(
		orpc.practicePack.find.queryOptions({
			input: {
				id: id,
			},
		}),
	);

	const [answers, setAnswers] = useState<Record<number, number>>({});

	useEffect(() => {
		if (pack.data?.questions) {
			const savedAnswers: Record<number, number> = {};
			pack.data.questions.forEach((q) => {
				if (q.selectedAnswerId !== null) {
					savedAnswers[q.id] = q.selectedAnswerId;
				}
			});
			setAnswers(savedAnswers);
		}
	}, [pack.data]);

	const saveMutation = useDebouncedMutation(
		orpc.practicePack.saveAnswer.mutationOptions(),
		500, // 500ms delay
	);

	const submitMutation = useMutation(
		orpc.practicePack.submitAttempt.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.practicePack.list.key(),
				});
				navigate({ to: "/latihan-soal" });
			},
		}),
	);

	const handleAnswerChange = (questionId: number, answerId: number) => {
		setAnswers((prev) => ({ ...prev, [questionId]: answerId }));

		if (pack.data?.attemptId) {
			saveMutation.debouncedMutate({
				id: id,
				questionId,
				selectedAnswerId: answerId,
			});
		}
	};

	if (Number.isNaN(id)) return notFound();

	const handleSubmit = () => {
		if (pack.data?.attemptId) {
			submitMutation.mutate({ id: id });
		}
	};

	if (pack.isPending) {
		return (
			<Container className="pt-20">
				<p className="animate-pulse">Loading...</p>
			</Container>
		);
	}

	if (pack.isError) {
		return (
			<Container className="pt-20">
				<p className="text-red-500">Error: {pack.error.message}</p>
			</Container>
		);
	}

	return (
		<>
			<h1 className="mb-6 font-bold text-2xl">{pack.data?.title}</h1>

			<div className="space-y-6">
				{pack.data?.questions.map((q, idx) => (
					<Card key={q.id} className="p-6">
						<h3 className="mb-4 font-medium text-lg">
							{idx + 1}. {q.content}
						</h3>
						<div className="space-y-2">
							{q.answers.map((answer) => (
								<Label
									key={answer.id}
									className="flex cursor-pointer items-center gap-2 rounded border p-3 hover:bg-muted"
								>
									<input
										type="radio"
										name={`question-${q.id}`}
										value={answer.id}
										checked={answers[q.id] === answer.id}
										onChange={() => handleAnswerChange(q.id, answer.id)}
										className="cursor-pointer"
									/>
									<span>{answer.content}</span>
								</Label>
							))}
						</div>
					</Card>
				))}

				{pack.data?.questions && pack.data.questions.length > 0 && (
					<Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full">
						{submitMutation.isPending ? "Memasak..." : "Kumpulkan"}
					</Button>
				)}
			</div>
		</>
	);
}
