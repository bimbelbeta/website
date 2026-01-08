import { WarningOctagon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ErrorComponent({ error }: { error: Error }) {
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Container className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center text-center">
				<div className="rounded-full bg-destructive/10 p-4">
					<WarningOctagon className="size-12 text-destructive" weight="fill" />
				</div>
				<h1 className="mt-4 font-bold text-3xl text-neutral-1000">Terjadi Kesalahan</h1>
				<p className="mt-2 max-w-md text-neutral-600">
					Maaf, sepertinya terjadi masalah saat memuat halaman ini. Silakan coba lagi nanti atau hubungi bantuan jika
					masalah berlanjut.
				</p>
				{process.env.NODE_ENV === "development" && (
					<pre className="mt-4 max-w-full overflow-auto rounded-lg bg-neutral-100 p-4 text-left text-xs">
						{error.message}
					</pre>
				)}
				<div className="mt-8 flex gap-4">
					<Button
						variant="outline"
						onClick={() => {
							router.invalidate();
						}}
					>
						Coba Lagi
					</Button>
					<Button
						onClick={() => {
							window.location.href = "/";
						}}
					>
						Kembali ke Beranda
					</Button>
				</div>
			</div>
		</Container>
	);
}
