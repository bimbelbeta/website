import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
import TiptapSimpleEditor from "@/components/tiptap-simple-editor";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/classes/$shortName/$contentId/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { contentId } = Route.useParams();
	const queryClient = useQueryClient();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	const saveMutation = useMutation(
		orpc.admin.subtest.upsertNote.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getContentById.queryKey({
						input: { contentId: Number(contentId) },
					}),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Gagal menyimpan catatan");
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.admin.subtest.deleteNote.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getContentById.queryKey({
						input: { contentId: Number(contentId) },
					}),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Gagal menghapus catatan");
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			content: {} as object,
		},
		onSubmit: async ({ value }) => {
			saveMutation.mutate({
				id: Number(contentId),
				content: value.content,
			});
		},
		validators: {
			onSubmit: type({
				content: "object",
			}),
		},
	});

	// Update form when content loads
	if (content.data?.note) {
		if (form.state.values.content !== content.data.note.content) {
			form.setFieldValue("content", (content.data.note.content as object) || {});
		}
	}

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat catatan...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const hasNote = !!content.data.note;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Edit Catatan Materi</h2>
				<div className="flex gap-4">
					<form.Subscribe>
						{(state) => (
							<Button type="submit" disabled={!state.canSubmit || saveMutation.isPending} size="sm">
								{saveMutation.isPending ? "Menyimpan..." : "Simpan Catatan"}
							</Button>
						)}
					</form.Subscribe>

					{hasNote && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button type="button" variant="destructive" disabled={deleteMutation.isPending} size="sm">
									Hapus Catatan
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Hapus Catatan?</AlertDialogTitle>
									<AlertDialogDescription>
										Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Batal</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => {
											deleteMutation.mutate({ id: Number(contentId) });
										}}
									>
										Hapus
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="content">
					{(field) => (
						<div className="space-y-2">
							<TiptapSimpleEditor content={field.state.value} onChange={(content) => field.handleChange(content)} />
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			</form>
		</div>
	);
}
