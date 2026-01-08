import { ArrowRightIcon, ListIcon, SignOutIcon, SpinnerIcon, XIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links = [
	{
		name: "Dashboard",
		to: "/dashboard",
	},
	{
		name: "Kelas",
		to: "/classes",
	},
	{
		name: "Premium",
		to: "/premium",
	},
] as const;

export function HeaderDashboard({ session }: { session: typeof authClient.$Infer.Session | null }) {
	const location = useLocation();
	const [open, setOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="fixed inset-x-0 top-0 z-50">
			{!session?.user.isPremium && !location.pathname.startsWith("/classes/") && (
				<div className="flex items-center justify-center gap-2 bg-primary-200 p-2 text-white max-sm:flex-col max-sm:text-center sm:gap-4">
					Dapatkan Semua Fitur dan Akses
					<Button variant="default" size={"sm"} asChild>
						<Link to="/premium">
							Premium Sekarang <ArrowRightIcon />
						</Link>
					</Button>
				</div>
			)}
			<div className="flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-accent border-b-2 bg-white px-6 backdrop-blur-lg md:px-8">
				<Link to="/" className="relative size-12">
					<Image src="/logo.svg" alt="bimbelbeta Logo" layout="fullWidth" className="pointer-events-none select-none" />
				</Link>

				<div className="hidden h-full items-center md:flex">
					{links.map((link) => (
						<Button
							key={link.to}
							variant={"navbar"}
							size={"full"}
							data-active={location.pathname.startsWith(link.to) ? "true" : "false"}
							asChild
						>
							<Link to={link.to}>{link.name}</Link>
						</Button>
					))}
				</div>

				<div className="hidden md:flex md:items-center md:gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger className="flex items-center gap-2">
							{session?.user.isPremium && (
								<Badge variant="secondary" className="bg-primary text-primary-foreground">
									Premium
								</Badge>
							)}
							<Avatar>
								<AvatarImage src={session?.user.image as string} alt="User Profile Picture" />
								<AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
							<DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
								<SignOutIcon />
								Log Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
					<ListIcon className="size-6" />
				</Button>
			</div>

			{mobileMenuOpen && (
				<div className="fixed inset-x-0 top-0 z-50 flex flex-col bg-white p-6 shadow-lg md:hidden">
					<div className="flex items-center justify-between">
						<Link to="/" className="relative size-12" onClick={() => setMobileMenuOpen(false)}>
							<Image
								src="/logo.svg"
								alt="bimbelbeta Logo"
								layout="fullWidth"
								className="pointer-events-none select-none"
							/>
						</Link>
						<Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
							<XIcon className="size-6" />
						</Button>
					</div>

					<div className="mt-8 flex flex-col gap-4">
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="rounded-md px-4 py-3 font-medium text-lg hover:bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								{link.name}
							</Link>
						))}
					</div>

					<div className="mt-12">
						<div className="mb-4 flex items-center gap-3 px-4">
							<Avatar>
								<AvatarImage src={session?.user.image as string} alt="User Profile Picture" />
								<AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
							<span className="font-medium">{session?.user.name}</span>
							{session?.user.isPremium && (
								<Badge variant="default" className="bg-primary text-primary-foreground">
									Premium
								</Badge>
							)}
						</div>
						<Button
							variant="destructive"
							className="w-full justify-start"
							onClick={() => {
								setMobileMenuOpen(false);
								setOpen(true);
							}}
						>
							<SignOutIcon className="mr-2" />
							Log Out
						</Button>
					</div>
				</div>
			)}

			<LogoutDialog open={open} onOpenChange={setOpen} />
		</header>
	);
}

const LogoutDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [pending, setPending] = useState(false);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
					<AlertDialogDescription>Kamu akan dikeluarkan dan harus login kembali.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Kembali</AlertDialogCancel>
					<Button
						onClick={async () => {
							setPending(true);
							await authClient.signOut();
							queryClient.removeQueries();
							navigate({ to: "/" });
							setPending(false);
						}}
						disabled={pending}
						variant={"destructive"}
					>
						{pending ? (
							<>
								<SpinnerIcon className="animate-spin" />
								Memasak...
							</>
						) : (
							<>
								<SignOutIcon weight="bold" /> Keluar
							</>
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
