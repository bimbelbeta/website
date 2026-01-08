import { ArrowLeft, CalendarBlank as Calendar, Clock } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/latihan-soal/riwayat/")({
	component: RouteComponent,
});

function RouteComponent() {
	const history = useQuery(orpc.practicePack.history.queryOptions());

	return (
		<>
			<div className="mb-6 flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/latihan-soal">
						<ArrowLeft />
					</Link>
				</Button>
				<h1 className="font-bold text-2xl">Riwayat Latihan</h1>
			</div>

			{history.isPending && <p className="animate-pulse">Memuat riwayat...</p>}

			{history.isError && <p className="text-red-500">Error: {history.error.message}</p>}

			{history.data && history.data.data.length === 0 && (
				<p className="mt-8 text-muted-foreground">Belum ada riwayat latihan soal</p>
			)}

			<div className="space-y-4">
				<p className="font-medium">Jumlah paket kelar: {history.data?.packsFinished}</p>

				{history.data?.data.map((attempt) => (
					<Card key={attempt.practicePackId} className="p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="mb-2 font-medium text-lg">Latihan Soal #{attempt.practicePackId}</h3>
								<div className="space-y-1 text-muted-foreground text-sm">
									{attempt.startedAt && (
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<span>
												Dimulai:{" "}
												{new Date(attempt.startedAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</span>
										</div>
									)}
									{attempt.completedAt && (
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											<span>
												Selesai:{" "}
												{new Date(attempt.completedAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "long",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
									<div>
										Status:{" "}
										<span
											className={
												attempt.status === "finished"
													? "text-green-600"
													: attempt.status === "ongoing"
														? "text-yellow-600"
														: "text-gray-600"
											}
										>
											{attempt.status === "finished"
												? "Selesai"
												: attempt.status === "ongoing"
													? "Sedang Dikerjakan"
													: "Belum Dimulai"}
										</span>
									</div>
								</div>
							</div>
							{attempt.status === "finished" && (
								<Button variant="outline" asChild>
									<Link to="/latihan-soal/riwayat/$id" params={{ id: attempt.practicePackId }}>
										Lihat Detail
									</Link>
								</Button>
							)}
						</div>
					</Card>
				))}
			</div>
		</>
	);
}
