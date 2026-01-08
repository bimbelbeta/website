import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect } from "react";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/notes")({
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

	const updateProgressMutation = useMutation(
		orpc.subtest.updateProgress.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getProgressStats.key(),
				});
			},
		}),
	);

	// Update progress when notes are viewed
	useEffect(() => {
		if (content.data?.note) {
			updateProgressMutation.mutate({
				id: Number(contentId),
				noteCompleted: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content.data?.note, contentId, updateProgressMutation.mutate]);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat catatan...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const note = content.data.note;
	if (!note) {
		return (
			<div className="space-y-4">
				<p className="font-semibold text-base text-primary-300">Catatan Materi</p>

				<div className="flex flex-col items-center justify-center gap-2 text-pretty text-center">
					<Image src="/avatar/confused-avatar.webp" alt="Empty State" width={150} height={150} />
					<p>
						Ups, kontennya belum tersedia,
						<br />
						Tunggu kontennya diracik dulu ya!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="font-semibold text-base text-primary-300">Catatan Materi</p>

			<h2 className="font-bold text-2xl">{content.data.title}</h2>

			<hr />

			<TiptapRenderer content={note.content} />
		</div>
	);
}
