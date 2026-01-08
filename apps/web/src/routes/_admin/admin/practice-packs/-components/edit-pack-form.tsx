import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

interface EditPackFormProps {
	pack: {
		id: number;
		title: string;
		description: string | null;
	};
	onSuccess?: () => void;
	onCancel?: () => void;
}

const formValidator = type({
	title: "string>0",
	"description?": "string",
});

export function EditPackForm({ pack, onSuccess, onCancel }: EditPackFormProps) {
	const queryClient = useQueryClient();

	const updateMutation = useMutation(
		orpc.admin.practicePack.updatePack.mutationOptions({
			onSuccess: () => {
				toast.success("Practice pack updated successfully");
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] === orpc.admin.practicePack.listPacks.queryKey({ input: { limit: 0, offset: 0 } })[0],
				});
				queryClient.invalidateQueries(orpc.admin.practicePack.getPack.queryOptions({ input: { id: pack.id } }));
				onSuccess?.();
			},
			onError: (error) => {
				toast.error("Failed to update practice pack", {
					description: String(error),
				});
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			title: pack.title,
			description: pack.description || "",
		},
		onSubmit: async ({ value }) => {
			const validation = formValidator(value);
			if (validation instanceof type.errors) {
				toast.error("Please fill all required fields");
				return;
			}

			updateMutation.mutate({
				id: pack.id,
				title: value.title,
				description: value.description || undefined,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="title">
				{(field) => (
					<div>
						<Label htmlFor="edit-title">Title *</Label>
						<Input
							id="edit-title"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Practice pack title"
							className="mt-2"
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div>
						<Label htmlFor="edit-description">Description</Label>
						<Input
							id="edit-description"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Optional description"
							className="mt-2"
						/>
					</div>
				)}
			</form.Field>

			<div className="flex gap-2">
				<Button type="submit" disabled={updateMutation.isPending} className="flex-1">
					{updateMutation.isPending ? (
						<>
							<Loader />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
