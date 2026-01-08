import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
	return (
		<Container className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center text-center">
				<Image
					src="/avatar/confused-avatar.webp"
					alt="Not Found"
					width={250}
					height={250}
					className="pointer-events-none select-none"
				/>
				<h1 className="mt-4 font-bold text-3xl text-neutral-1000">Halaman Tidak Ditemukan</h1>
				<p className="mt-2 text-neutral-600">Ups! Sepertinya halaman yang kamu cari sudah pindah atau tidak ada.</p>
				<Button className="mt-8" asChild>
					<Link to="/">Kembali ke Beranda</Link>
				</Button>
			</div>
		</Container>
	);
}
