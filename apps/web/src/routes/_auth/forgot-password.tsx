import { CheckCircle } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type } from "arktype";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";

const resetPasswordSearchSchema = type({
	email: "string.email?",
});

export const Route = createFileRoute("/_auth/forgot-password")({
	head: () => ({
		meta: createMeta({
			title: "Lupa Password",
			description: "Lupa password akun bimbelbeta? Reset password kamu melalui email yang terdaftar.",
		}),
	}),
	component: RouteComponent,
	validateSearch: resetPasswordSearchSchema,
});

function RouteComponent() {
	const navigate = useNavigate();
	const location = useLocation();
	const search = useSearch({ from: "/_auth/forgot-password" });
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			email: search.email || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: `${location.url.origin}/reset-password`,
			});

			if (error) {
				console.error(error);
				toast.error(error.message || "Terjadi kesalahan. Silakan coba lagi.");
			} else {
				setHasSubmitted(true);
			}
			setIsSubmitting(false);
		},
		validators: {
			onSubmit: type({
				email: "string.email",
			}),
		},
	});

	return (
		<main className="flex min-h-screen w-full flex-col items-center pt-24">
			<div className="w-full max-w-md">
				<Image src="/avatar/study-avatar.webp" alt="Study Avatar" width={128} height={128} className="mx-auto" />
				<div className="w-full rounded-sm border border-primary/50 bg-white p-8 shadow-lg">
					<div className="flex flex-col items-center gap-2 text-center">
						{" "}
						<h1 className="font-bold text-3xl text-primary">Lupa Password</h1>
					</div>

					{hasSubmitted ? (
						<div className="mt-8 space-y-6">
							<Alert className="border-primary/50 bg-primary/5">
								<CheckCircle className="h-5 w-5 text-primary" weight="fill" />
								<AlertTitle className="font-bold text-primary">Email Terkirim!</AlertTitle>
								<AlertDescription className="text-foreground/80">
									Kami telah mengirimkan instruksi pengaturan ulang kata sandi ke email Anda. Silakan periksa inbox (dan
									folder spam) Anda.
								</AlertDescription>
							</Alert>

							<Button onClick={() => navigate({ to: "/login" })} className="w-full">
								Kembali ke Halaman Masuk
							</Button>
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="mt-8 space-y-4"
						>
							<form.Field name="email">
								{(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="email@contoh.com"
												autoComplete="email"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							</form.Field>

							<form.Subscribe>
								{(state) => (
									<Button
										type="submit"
										className="w-full"
										disabled={!state.canSubmit || state.isSubmitting || isSubmitting}
									>
										{state.isSubmitting || isSubmitting ? "Memuat..." : "Kirim Instruksi"}
									</Button>
								)}
							</form.Subscribe>
						</form>
					)}
				</div>

				{!hasSubmitted && (
					<p className="mt-4 text-center text-sm">
						Ingat password?{" "}
						<Link type="button" to="/login" className="font-bold text-primary hover:underline">
							Masuk
						</Link>
					</p>
				)}
			</div>
		</main>
	);
}
