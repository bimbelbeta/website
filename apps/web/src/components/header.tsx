import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function Header() {
	const session = authClient.useSession();

	return (
		<div className="fixed inset-x-0 top-0 z-50 flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-accent border-b-2 bg-white px-6 backdrop-blur-lg md:px-8">
			<Link to="/" className="relative size-12 text-primary">
				<Image src={"/logo.svg"} alt="Logo bimbelbeta" layout="fullWidth" className="pointer-events-none select-none" />
			</Link>
			<div className="flex items-center gap-2">
				{session.data?.user ? (
					<Button variant={"outline"} asChild>
						<Link to="/dashboard">Lanjut Belajar</Link>
					</Button>
				) : (
					<Button variant={"default"} asChild>
						<Link to="/login">Coba Gratis</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
