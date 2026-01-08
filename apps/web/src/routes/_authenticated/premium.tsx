import { InfinityIcon, SparkleIcon, SpinnerIcon, StarIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/premium")({
	component: RouteComponent,
});

const features = [
	{
		icon: <InfinityIcon size={24} />,
		title: "Akses Tanpa Batas",
		description: "Buka semua materi latihan tanpa batasan apapun",
	},
	{
		icon: <SparkleIcon size={24} />,
		title: "Tips & Trik Eksklusif",
		description: "Dapatkan strategi rahasia yang tidak tersedia di paket gratis",
	},
	{
		icon: <StarIcon size={24} />,
		title: "Komunitas Premium",
		description: "Bergabung dengan grup diskusi eksklusif untuk pengguna premium",
	},
];

function PremiumHeader() {
	return (
		<div className="relative overflow-hidden rounded-[10px] bg-primary-300 text-white">
			<div className="grid grid-cols-1 gap-6 px-6 pt-8 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:py-10">
				<div className="relative z-10 max-w-xl">
					<h1 className="font-bold text-[24px] leading-tight sm:text-[30px]">Upgrade ke Premium</h1>
					<p className="mt-2 text-[14px] text-white/90 leading-5.25">
						Investasikan masa depanmu sekarang! Dapatkan akses penuh ke semua fitur bimbelbeta dan tingkatkan peluang
						kelulusanmu.
					</p>
				</div>

				<div className="relative -mx-6 h-27.5 overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible">
					<div className="absolute top-10 right-4 bottom-0 size-45 rounded-full bg-primary-400 sm:top-2" />
					<Image
						src="/avatar/premium-pricing-card-avatar.webp"
						alt="Premium Avatar"
						width={260}
						height={260}
						className="absolute right-0 size-52.5 -translate-y-10 select-none object-cover sm:bottom-0 sm:translate-y-1/2"
					/>
				</div>
			</div>
		</div>
	);
}

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const transactionMutation = useMutation(orpc.transaction.premium.mutationOptions());
	const [token, setToken] = useState<string | undefined>();

	useEffect(() => {
		const midtransScriptUrl = import.meta.env.PROD
			? "https://app.midtrans.com/snap/snap.js"
			: "https://app.sandbox.midtrans.com/snap/snap.js";
		const scriptTag = document.createElement("script");
		scriptTag.src = midtransScriptUrl;
		const myMidtransClientKey = (process.env.MIDTRANS_CLIENT_KEY ?? import.meta.env.MIDTRANS_CLIENT_KEY) || "";
		scriptTag.setAttribute("data-client-key", myMidtransClientKey);
		document.body.appendChild(scriptTag);
		return () => {
			document.body.removeChild(scriptTag);
		};
	}, []);

	useEffect(() => {
		if (token) {
			// @ts-expect-error - Midtrans Snap is loaded globally
			window.snap.pay(token, {
				onSuccess: () => {
					toast.success("Pembayaran berhasil! Selamat menjadi premium!");
					window.location.reload();
				},
				onPending: () => {
					toast.info("Menunggu pembayaran...");
				},
				onError: () => {
					toast.error("Pembayaran gagal. Silakan coba lagi.");
				},
				onClose: () => {
					toast.warning("Pembayaran dibatalkan.");
				},
			});
		}
	}, [token]);

	const isPremium = session?.user.isPremium;

	return (
		<Container className="space-y-8">
			<PremiumHeader />

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<Card className="relative overflow-hidden border-2 border-primary-100 bg-white p-6 shadow-lg">
						<div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary-100 opacity-50 blur-2xl" />

						<h2 className="relative z-10 font-semibold text-lg text-neutral-1000">Paket Premium</h2>
						<div className="relative z-10 mt-4 flex flex-col items-baseline">
							<span className="font-bold text-3xl text-primary-500">Rp100.000</span>
							<span className="ml-1 text-neutral-500 text-sm">/ bulan</span>
						</div>
						<p className="relative z-10 mt-2 text-neutral-600 text-sm">
							Akses penuh ke semua materi dan fitur eksklusif bimbelbeta.
						</p>

						<Button
							size="lg"
							className="mt-6 w-full hover:cursor-pointer"
							disabled={true}
							onClick={async () => {
								if (isPremium) return;
								transactionMutation
									.mutateAsync({})
									.then((data) => {
										setToken(data.token);
									})
									.catch(() => {
										toast.error("Gagal membuat transaksi. Silakan coba lagi.");
									});
							}}
						>
							{isPremium ? (
								<>Kamu sudah Premium!</>
							) : transactionMutation.isPending ? (
								<>
									<SpinnerIcon className="animate-spin" />
									Memproses...
								</>
							) : (
								<>Segera Hadir</>
							)}
						</Button>

						<div className="relative z-10 mt-6 space-y-2">
							<p className="text-center text-neutral-400 text-xs">Segera tersedia</p>
						</div>
					</Card>
				</div>

				<div className="space-y-6 lg:col-span-2">
					<div>
						<h2 className="mb-4 font-bold text-neutral-1000 text-xl">Fitur Unggulan</h2>
						<div className="grid gap-4">
							{features.map((feature) => (
								<Card key={feature.title} className="border-neutral-200 p-4">
									<div className="flex items-start gap-4">
										<div className="shrink-0 rounded-full bg-primary-100 p-2 text-primary-500">{feature.icon}</div>
										<div>
											<h3 className="font-semibold text-neutral-1000">{feature.title}</h3>
											<p className="mt-1 text-neutral-600 text-sm">{feature.description}</p>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}
