import { ArrowLeft } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/practice-packs/create")({
	component: CreatePracticePackPage,
});

function CreatePracticePackPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const createMutation = useMutation(
		orpc.admin.practicePack.createPack.mutationOptions({
			onSuccess: () => {
				toast.success("Practice pack berhasil dibuat");
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] === orpc.admin.practicePack.listPacks.queryKey({ input: { limit: 0, offset: 0 } })[0],
				});
				navigate({ to: "/admin/practice-packs" });
			},
			onError: (error) => {
				toast.error("Gagal membuat practice pack", {
					description: error.message,
				});
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			createMutation.mutate({
				title: value.title,
				description: value.description || undefined,
			});
		},
		validators: {
			onSubmit: type({
				title: "string>0",
				description: "string",
			}),
		},
	});

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mb-6 sm:mb-8">
				<Button variant="ghost" size="sm" className="mb-4" asChild>
					<Link to="/admin/practice-packs">
						<ArrowLeft className="size-4" />
						<span className="hidden sm:inline">Back to Practice Packs</span>
						<span className="sm:inline">Back</span>
					</Link>
				</Button>

				<h1 className="font-bold text-2xl sm:text-3xl">Create Practice Pack</h1>
				<p className="text-muted-foreground">Buat paket latihan soal baru</p>
			</div>

			<Card className="w-full rounded-xl p-4 shadow-sm sm:max-w-2xl sm:p-6">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="space-y-4 sm:space-y-6">
						<form.Field name="title">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Title <span className="text-destructive">*</span>
									</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g. Matematika Dasar"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={String(error)} className="text-destructive text-sm">
											{String(error)}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Description</Label>
									<textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Describe what this practice pack is about..."
										className="flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={String(error)} className="text-destructive text-sm">
											{String(error)}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<div className="flex flex-col gap-4 sm:flex-row">
							<form.Subscribe>
								{(state) => (
									<Button
										type="submit"
										disabled={!state.canSubmit || state.isSubmitting || createMutation.isPending}
										className="w-full sm:w-auto"
									>
										{createMutation.isPending ? "Creating..." : "Create Practice Pack"}
									</Button>
								)}
							</form.Subscribe>

							<Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
								<Link to="/admin/practice-packs">Cancel</Link>
							</Button>
						</div>
					</div>
				</form>
			</Card>
		</main>
	);
}
