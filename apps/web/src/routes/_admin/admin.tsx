import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";

export const Route = createFileRoute("/_admin/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<div className="flex min-h-screen">
			<AdminSidebar />
			<main className="flex-1 bg-background p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<Outlet />
			</main>
		</div>
	);
}
