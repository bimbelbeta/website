import { ArrowCircleRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/utils/orpc";
import { LastClasses } from "../-components/last-classes";
import { UserProgress } from "../-components/user-progress";

export const Route = createFileRoute("/_authenticated/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const { data, error } = useQuery(orpc.social.queryOptions());
	const [showDialog, setShowDialog] = useState(false);

	const handleSocialClick = (e: React.MouseEvent, socialLink?: string) => {
		if (!socialLink || error) {
			e.preventDefault();
			setShowDialog(true);
		}
	};

	return (
		<>
			<section className="flex w-full items-center justify-between gap-8 max-sm:flex-col-reverse max-sm:items-start">
				<div className="flex items-center gap-2">
					<p className="text-5xl">👋</p>
					<div className="text-primary">
						<h1 className="text-xl">
							Halo, <strong>{session?.user.name.split(" ")[0]}</strong>
						</h1>
						<p className="text-sm">Yuk lanjutkan perjalanan harimu</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2 max-sm:w-full [&>a]:flex [&>a]:justify-between [&>a]:gap-4 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
					<a
						href={data?.discord || "#"}
						rel={data?.discord ? "noopener noreferrer" : undefined}
						target={data?.discord ? "_blank" : undefined}
						onClick={(e) => handleSocialClick(e, data?.discord ?? undefined)}
						className="group relative overflow-clip bg-discord hover:bg-discord/80"
					>
						<p className="z-10">Join Discord</p>
						<ArrowCircleRightIcon size={24} />
						<Image
							src="/icons/discord.svg"
							width={70}
							height={70}
							className="absolute right-0 -bottom-[40%] opacity-50 transition-colors group-hover:-translate-y-1"
						/>
					</a>
					<a
						href={data?.whatsapp || "#"}
						rel={data?.whatsapp ? "noopener noreferrer" : undefined}
						target={data?.whatsapp ? "_blank" : undefined}
						onClick={(e) => handleSocialClick(e, data?.whatsapp ?? undefined)}
						className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80"
					>
						<p className="z-10">Join Whatsapp</p>
						<ArrowCircleRightIcon size={24} className="z-10" />
						<Image
							src="/icons/whatsapp.svg"
							width={70}
							height={70}
							className="absolute right-0 -bottom-[40%] opacity-50 transition-transform group-hover:-translate-y-1"
						/>
					</a>
				</div>
			</section>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ups, belum premium!</DialogTitle>
						<DialogDescription>Untuk bergabung bersama grup discord dan whatsapp, kamu perlu Premium</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDialog(false)}>
							Cancel
						</Button>
						<Link to="/premium">
							<Button>Continue</Button>
						</Link>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/** <DismissableAlert />*/}
			<UserProgress />
			<LastClasses />
		</>
	);
}
