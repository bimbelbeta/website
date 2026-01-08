import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
// import { TiptapEditor } from "@/components/tiptap-editor";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/classes/$shortName/$contentId/video")({
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
		orpc.admin.subtest.upsertVideo.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getContentById.queryKey({
						input: {
							contentId: Number(contentId),
						},
					}),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Gagal menyimpan video");
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.admin.subtest.deleteVideo.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getContentById.queryKey({
						input: {
							contentId: Number(contentId),
						},
					}),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Gagal menghapus video");
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			videoUrl: "",
			content: {} as object,
		},
		onSubmit: async ({ value }) => {
			saveMutation.mutate({
				id: Number(contentId),
				videoUrl: value.videoUrl,
				content: value.content,
			});
		},
		validators: {
			onSubmit: type({
				videoUrl: "string >= 1",
				content: "object",
			}),
		},
	});

	// Update form when content loads
	if (content.data?.video) {
		if (form.state.values.videoUrl !== content.data.video.videoUrl) {
			form.setFieldValue("videoUrl", content.data.video.videoUrl || "");
		}
		if (form.state.values.content !== content.data.video.content) {
			form.setFieldValue("content", (content.data.video.content as object) || {});
		}
	}

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat video...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const hasVideo = !!content.data.video;

	return (
		<div className="space-y-6">
			<div className="flex justify-between gap-4">
				<h2 className="font-semibold text-lg">Edit Video Materi</h2>
				<div className="flex gap-4">
					<form.Subscribe>
						{(state) => (
							<Button type="submit" disabled={!state.canSubmit || saveMutation.isPending} size="sm">
								{saveMutation.isPending ? "Menyimpan..." : "Simpan Video"}
							</Button>
						)}
					</form.Subscribe>

					{hasVideo && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button type="button" variant="destructive" disabled={deleteMutation.isPending} size="sm">
									Hapus Video
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Hapus Video?</AlertDialogTitle>
									<AlertDialogDescription>
										Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan.
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
				<form.Field name="videoUrl">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>URL Video (YouTube)</Label>
							<Input
								id={field.name}
								name={field.name}
								type="url"
								value={field.state.value as string}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="https://www.youtube.com/watch?v=..."
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="content">
					{(field) => (
						<div className="space-y-2">
							<Label>Konten Video (Deskripsi)</Label>
							{/* <TiptapEditor
                content={field.state.value}
                onChange={(content) => field.handleChange(content)}
              /> */}

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
