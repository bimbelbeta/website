import { useState } from "react";
import YouTube from "react-youtube";

export default function YouTubePlayer({ videoId }: { videoId: string }) {
	const [ready, setReady] = useState(false);

	const opts = {
		width: "100%",
		playerVars: {
			autoplay: 0,
			controls: 0,
			modestbranding: 0,
			rel: 0,
		},
	};

	return (
		<div className="relative h-full w-full">
			<div
				className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
					ready ? "pointer-events-none opacity-0" : "opacity-100"
				}`}
				aria-hidden={ready}
			>
				<div className="aspect-video h-full w-full animate-pulse rounded-xl bg-muted" />
			</div>
			<div className={`transition-opacity duration-300 ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}>
				<YouTube
					videoId={videoId}
					opts={opts}
					iframeClassName="w-full h-full aspect-video rounded-xl"
					onReady={() => setReady(true)}
					onError={() => setReady(true)}
				/>
			</div>
		</div>
	);
}
