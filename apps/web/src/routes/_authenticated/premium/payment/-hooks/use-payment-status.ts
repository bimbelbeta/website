import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export function usePaymentStatus(
	expectedStatus: "finish" | "unfinish" | "error",
	search: {
		order_id?: string;
		status_code?: number;
		transaction_status?: string;
	},
) {
	const { order_id, status_code, transaction_status } = search;
	const navigate = useNavigate();

	const { data, isLoading, error } = useQuery({
		...orpc.transaction.getStatus.queryOptions({ input: { orderId: order_id ?? "" } }),
		enabled: !!order_id,
		retry: false,
	});

	if (isLoading) {
		return { isLoading: true, data: null, order_id };
	}

	if (error || !data) {
		navigate({ to: "/premium" });
		return { isLoading: false, data: null, order_id: "" };
	}

	const statusMap = {
		finish: "success",
		unfinish: "pending",
		error: "failed",
	} as const;

	if (data.status !== statusMap[expectedStatus]) {
		const redirectMap: Record<"pending" | "success" | "failed", string> = {
			success: "/premium/payment/finish",
			pending: "/premium/payment/unfinish",
			failed: "/premium/payment/error",
		};

		navigate({
			to: redirectMap[data.status],
			search: { order_id, status_code, transaction_status },
		});
	}

	return { isLoading: false, data, order_id };
}
