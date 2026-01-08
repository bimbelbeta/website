import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PremiumGateModalProps {
	isOpen: boolean;
	onClose: () => void;
	contentType: "subtest" | "content";
	previewContent?: React.ReactNode;
}

export function PremiumGateModal({ isOpen, onClose, contentType, previewContent }: PremiumGateModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogOverlay className="bg-black/40 backdrop-blur-sm" />
			<DialogContent className="max-w-md overflow-hidden p-0">
				{/* Blurred Background with Preview */}
				<div className="relative">
					{previewContent && (
						<div className="absolute inset-0 z-0 overflow-hidden opacity-30 blur-md">
							<div className="h-40 scale-110 transform">{previewContent}</div>
						</div>
					)}

					{/* Content */}
					<Card className="relative z-10 border-none shadow-none">
						<CardHeader className="space-y-3 text-pretty text-center">
							<CardTitle className="text-xl">
								<span>
									<Image
										src="/logo.svg"
										alt="bimbelbeta Logo"
										width={75}
										height={75}
										className="pointer-events-none mx-auto select-none"
									/>
								</span>
								Ups, Kamu Belum Premium!
							</CardTitle>
							<CardDescription className="text-base">
								{contentType === "subtest" ? (
									<>Untuk membuka semua subtest UTBK (PU, PPU, PBM, PK, LBI, LBing, PM), premium dulu yuk!</>
								) : (
									<>Untuk membuka semua materi dan tips & trick, premium dulu yuk!</>
								)}
							</CardDescription>
						</CardHeader>

						<CardFooter className="flex justify-end gap-2 pt-2">
							<Link to="/classes" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
								Kembali
							</Link>
							<Link to="/premium" className={cn(buttonVariants(), "flex-1")}>
								Premium Sekarang
							</Link>
						</CardFooter>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import { buttonVariants } from "@/components/ui/button";
