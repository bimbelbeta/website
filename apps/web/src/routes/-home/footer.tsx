import { Image } from "@unpic/react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export default function Footer() {
	return (
		<footer className="bg-primary-300 *:text-white">
			<Container className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:py-12">
				<div>
					<div className="flex items-center justify-center gap-2 sm:justify-start">
						<Image
							src={"/logo.svg"}
							alt="Logo bimbelbeta"
							layout="fullWidth"
							className="pointer-events-none -ml-2.5 select-none"
						/>
						<h3 className="font-medium text-2xl">bimbelbeta</h3>
					</div>
					<p className="text-center sm:text-left">Ubah Persiapan Ujian Menjadi Investasi Masa Depan</p>
				</div>
				<div className="mt-6 flex flex-col items-center justify-end gap-4 sm:mt-0 sm:items-end">
					<div className="flex items-center gap-2">
						{DATA.footer.socials.map((social) => (
							<a
								key={social.label}
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(buttonVariants({ variant: "white", size: "icon" }))}
							>
								<social.icon className="size-6" weight="bold" />
							</a>
						))}
					</div>
					<div className="flex items-center gap-2 text-sm md:text-base">
						Dibangun bersama{" "}
						<a
							href="https://www.instagram.com/omahti_ugm"
							className="flex items-center gap-2 hover:opacity-80"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image
								src="/icons/OmahTI.webp"
								alt="OmahTI"
								width={111}
								height={15}
								sizes="60%"
								className="h-2.5 w-auto md:h-3"
							/>
						</a>
					</div>
				</div>
			</Container>
		</footer>
	);
}
