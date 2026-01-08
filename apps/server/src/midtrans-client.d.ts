declare module "midtrans-client" {
	export interface SnapTransaction {
		token: string;
		redirect_url: string;
	}

	export interface SnapConfig {
		isProduction: boolean;
		serverKey: string;
		clientKey: string;
	}

	export interface TransactionNotificationResponse {
		order_id: string;
		transaction_status: string;
		fraud_status?: string;
		payment_type?: string;
	}

	export interface TransactionApi {
		notification(input: unknown): Promise<TransactionNotificationResponse>;
	}

	export class Snap {
		constructor(config: SnapConfig);

		createTransaction(params: unknown): Promise<SnapTransaction>;

		transaction: TransactionApi;
	}
}
