import { LockIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { canAccessContent } from "@/lib/premium-config";
import { PremiumGateModal } from "./premium-gate-modal";

interface PremiumRouteGuardProps {
	children: React.ReactNode;
	isPremiumRequired: boolean;
	subtestOrder?: number;
	contentOrder?: number;
	userIsPremium: boolean;
	userRole?: string;
	contentType?: "subtest" | "content";
}

export function PremiumRouteGuard({
	children,
	isPremiumRequired,
	subtestOrder,
	contentOrder,
	userIsPremium,
	userRole,
	contentType = "content",
}: PremiumRouteGuardProps) {
	const [showPremiumModal, setShowPremiumModal] = useState(false);
	const [isPreviewMode, setIsPreviewMode] = useState(false);

	useEffect(() => {
		const hasAccess = userIsPremium || userRole === "admin" || !isPremiumRequired;
		// Check if user can access this specific content based on subtest and content order
		const canAccess =
			subtestOrder !== undefined && contentOrder !== undefined
				? canAccessContent(userIsPremium, userRole, subtestOrder, contentOrder)
				: hasAccess;

		if (!hasAccess && !canAccess) {
			setShowPremiumModal(true);
			setIsPreviewMode(false);
		}
	}, [isPremiumRequired, userIsPremium, userRole, subtestOrder, contentOrder]);

	if (showPremiumModal && !isPreviewMode) {
		return (
			<>
				<div className="relative">
					<div className="pointer-events-none opacity-50 blur-sm">{children}</div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex flex-col items-center gap-2 text-neutral-600">
							<LockIcon size={48} className="text-neutral-400" />
							<p className="text-center font-medium text-sm">Konten Premium</p>
						</div>
					</div>
				</div>
				<PremiumGateModal
					isOpen={showPremiumModal}
					onClose={() => {
						setIsPreviewMode(true);
						setShowPremiumModal(false);
					}}
					contentType={contentType}
					previewContent={children}
				/>
			</>
		);
	}

	if (isPreviewMode && contentOrder && contentOrder > 1 && !userIsPremium) {
		return (
			<div className="relative">
				{children}
				<div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent backdrop-blur-[2px]" />
				<div className="absolute inset-0 flex items-end justify-center pb-8">
					<button
						type="button"
						onClick={() => setShowPremiumModal(true)}
						className="rounded-full bg-white px-6 py-3 font-semibold text-neutral-900 shadow-lg transition-transform hover:scale-105"
					>
						Lihat Selengkapnya dengan Premium
					</button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
