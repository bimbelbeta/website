import { createFileRoute, Outlet, redirect, useLocation, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { HeaderDashboard } from "@/components/header-dashboard";
import { Container } from "@/components/ui/container";
import { $getSession } from "@/lib/get-user";
import { createMeta } from "@/lib/seo-utils";

export const Route = createFileRoute("/_authenticated")({
	head: () => ({
		meta: createMeta({
			noIndex: true,
		}),
	}),
	component: AuthedLayout,
	beforeLoad: async ({ context, preload }) => {
		if (preload) return;
		const { session } = await $getSession(context.queryClient);

		return { session };
	},
	loader: ({ location, context }) => {
		if (!context.session)
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
	},
});

function AuthedLayout() {
	const context = Route.useRouteContext();
	const location = useLocation();
	const routerState = useRouterState();
	const stablePathnameRef = useRef(location.pathname);

	// Only update pathname when route is fully loaded (not pending) to prevent layout shifting yg too soon
	const isPending = routerState.isLoading || routerState.isTransitioning;

	useEffect(() => {
		if (!isPending) {
			stablePathnameRef.current = location.pathname;
		}
	}, [location.pathname, isPending]);

	const pathname = isPending ? stablePathnameRef.current : location.pathname;

	return (
		<>
			<HeaderDashboard session={context.session} />

			{/^\/classes\/[^/]+\/[^/]+\/(video|notes|latihan-soal)/.test(pathname) ? (
				<Container className="flex flex-col gap-6 py-0">
					<Outlet />
				</Container>
			) : (
				<Container className="flex flex-col gap-6 pt-40">
					<Outlet />
				</Container>
			)}
		</>
	);
}
