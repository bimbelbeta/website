import { Image } from "@unpic/react";
import Carousel from "@/components/carousel";
import { DATA } from "./data";

export default function Testimone() {
	return (
		<section className="overflow-x-clip">
			<div className="container relative mx-auto my-20 flex w-full max-w-4xl flex-col overflow-visible px-4">
				<div className="absolute -right-50 z-2 size-75 translate-y-1/2 rounded-full bg-primary-100" />

				<div className="absolute top-10 -left-30 z-2 size-45 rounded-full bg-fourtiary-100" />

				<div className="absolute top-10 -left-40 z-2 size-11 rounded-full bg-yellow-100" />

				<Image
					src="/decorations/book.webp"
					alt="Buku Wan***t"
					width={300}
					height={150}
					className="absolute -top-3 -left-50 z-2 w-62.5 translate-y-1/2 sm:w-75"
				/>

				<Image
					src="/decorations/pencil.webp"
					alt="Pensil 2B"
					width={300}
					height={150}
					className="absolute -top-3 -right-25 z-4 w-62.5 -translate-y-1/2 lg:-right-35 lg:translate-y-1/2"
				/>

				<main className="relative z-3 flex flex-col gap-y-32 rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-8">
					<div className="mb-4 text-center">
						<h2 className="font-bold text-2xl">
							Ruang Aman untuk <span className="text-primary-300">Bertanya & Tumbuh</span>
						</h2>
						<p className="font-medium text-sm">Ribuan siswa telah menemukan rumah kedua mereka di sini.</p>
					</div>

					<Image
						src="/avatar/testimone-avatar.webp"
						alt="Empty State"
						width={300}
						height={150}
						className="absolute inset-0 m-auto w-62.5 sm:w-75"
					/>

					<Carousel
						items={[...DATA.testimone]}
						showNavigation={true}
						showDots={true}
						autoPlay={false}
						gap={36}
						responsiveGap={true}
						className=""
					/>
				</main>
			</div>
		</section>
	);
}
