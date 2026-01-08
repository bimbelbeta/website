declare module "midtrans-client" {
	export type SnapOptions = {
		isProduction: boolean;
		serverKey: string;
		clientKey: string;
	};

	export class Snap {
		constructor(options: SnapOptions);
		createTransaction(params: unknown): Promise<{
			token: string;
			redirect_url: string;
		}>;
		transaction: {
			notification(params: unknown): Promise<{
				order_id: string;
				transaction_status: string;
				fraud_status?: string;
			}>;
		};
	}
}
