import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type } from "arktype";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/reset-password")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			token: search.token as string,
		};
	},
});

function RouteComponent() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center pt-24">
			<ResetPasswordForm />
		</main>
	);
}

function ResetPasswordForm() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			if (value.newPassword !== value.confirmPassword) {
				toast.error("Password tidak sama");
				return;
			}
			await authClient.resetPassword(
				{
					newPassword: value.newPassword,
					token: search.token,
				},
				{
					onSuccess: () => {
						toast.success("Password berhasil diubah");
						navigate({ to: "/login" });
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: type({
				newPassword: "string >= 8",
				confirmPassword: "string >= 8",
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full max-w-md">
			<Image src="/avatar/study-avatar.webp" alt="Study Avatar" width={128} height={128} className="mx-auto" />
			<div className="w-full rounded-sm border border-primary/50 bg-white p-8 shadow-lg">
				<div className="flex flex-col items-center gap-2 text-center">
					{" "}
					<h1 className="text-3xl text-primary">
						<span className="font-bold">Reset </span>
						Password
					</h1>
					<p className="text-sm">Masukkan password baru anda</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="mt-8 space-y-4"
				>
					<div>
						<form.Field name="newPassword">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password Baru</Label>
									<Input
										id={field.name}
										name={field.name}
										type="password"
										autoFocus
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500 text-xs">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div>
						<form.Field name="confirmPassword">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Konfirmasi Password</Label>
									<Input
										id={field.name}
										name={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500 text-xs">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<form.Subscribe>
						{(state) => (
							<Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
								{state.isSubmitting ? "Memuat..." : "Ubah Password"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</div>

			<p className="mt-4 text-center text-sm">
				Sudah punya akun?{" "}
				<Link to="/login" className="font-bold text-primary">
					Masuk
				</Link>
			</p>
		</div>
	);
}
