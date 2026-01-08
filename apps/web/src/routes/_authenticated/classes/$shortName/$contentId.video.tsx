import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useRef } from "react";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import YouTubePlayer from "@/components/youtube-player";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/video")({
	component: RouteComponent,
});

function RouteComponent() {
	const { contentId } = Route.useParams();
	const queryClient = useQueryClient();
	const hasUpdatedProgress = useRef(false);

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	const updateProgressMutation = useMutation(
		orpc.subtest.updateProgress.mutationOptions({
			onSuccess: () => {
				console.log("Progress updated successfully for video:", contentId);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getProgressStats.key(),
				});
				// Also invalidate the content list to refresh completed status
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.listContentByCategory.key(),
				});
			},
			onError: (error) => {
				console.error("Failed to update progress:", error);
				// Reset flag so it can retry
				hasUpdatedProgress.current = false;
			},
		}),
	);

	// Update progress when video is viewed
	useEffect(() => {
		if (content.data?.video && !hasUpdatedProgress.current) {
			hasUpdatedProgress.current = true;
			updateProgressMutation.mutate({
				id: Number(contentId),
				videoCompleted: true,
			});
		}
	}, [content.data?.video, contentId, updateProgressMutation]);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat video...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const video = content.data.video;
	if (!video) {
		return (
			<div className="space-y-4">
				<p className="font-semibold text-base text-primary-300">Video Materi</p>

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

	const videoId = video.videoUrl?.split("v=")[1] ?? "";

	return (
		<div className="space-y-4">
			<p className="font-semibold text-base text-primary-300">Video Materi</p>

			<div className="aspect-video w-full">
				<YouTubePlayer videoId={videoId} />
			</div>

			<h2 className="font-bold text-2xl">{content.data.title}</h2>
			<hr />

			<h3 className="font-semibold text-lg">Tentang Video</h3>
			<TiptapRenderer content={video.content} />
		</div>
	);
}
