import { WarningCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { usePaymentStatus } from "./-hooks/use-payment-status";

export const Route = createFileRoute("/_authenticated/premium/payment/error")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		order_id: search.order_id as string | undefined,
		status_code: search.status_code as number | undefined,
		transaction_status: search.transaction_status as string | undefined,
	}),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { isLoading, order_id } = usePaymentStatus("error", search);

	if (isLoading) return null;

	return (
		<Container className="flex min-h-[calc(100vh-200px)] items-center justify-center">
			<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-red-500 p-8 shadow-lg">
				<div className="flex size-24 items-center justify-center rounded-full bg-white/20">
					<WarningCircleIcon size={64} className="text-white" />
				</div>

				<div className="text-center">
					<h1 className="mb-2 font-bold text-3xl text-white">Terjadi Kesalahan</h1>
					<p className="text-sm text-white/90">
						Maaf, terjadi kesalahan saat memproses pembayaran. Silakan coba lagi atau hubungi tim support kami.
					</p>
					{order_id && <p className="mt-2 text-white/70 text-xs">Order ID: {order_id}</p>}
				</div>

				<Button variant="white" className="w-full" asChild>
					<Link to="/dashboard">Ke Dashboard</Link>
				</Button>
			</div>
		</Container>
	);
}
