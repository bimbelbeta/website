import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { $getSession } from "@/lib/get-user";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context, preload }) => {
		if (preload) return;
		const { session } = await $getSession(context.queryClient);

		return { session };
	},
	loader: ({ context }) => {
		if (context.session)
			throw redirect({
				to: "/dashboard",
			});
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div className="mx-auto w-full max-w-3xl">
			<Outlet />
		</div>
	);
}
