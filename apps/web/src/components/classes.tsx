import {
	ArrowRightIcon,
	CaretRightIcon,
	CheckCircleIcon,
	DotsNineIcon,
	ExamIcon,
	EyeIcon,
	EyeSlashIcon,
	LockIcon,
	LockKeyIcon,
	NoteIcon,
	PencilSimpleIcon,
	PlayCircleIcon,
	PlusIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Reorder, useDragControls } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { canAccessContent, isSubtestPremium } from "@/lib/premium-config";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";
import { BackButton } from "./back-button";
import { buttonVariants } from "./ui/button";

export function SubtestHeader() {
	const isAdmin = useIsAdmin();

	const title = isAdmin ? "Hi Min, ini Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";

	const description = isAdmin
		? "Pilih subtest-subtest UTBK yang ingin diubah, dihapus, atau ditambahkan"
		: "Yuk belajar bersama untuk sukses dalam UTBK!";

	return (
		<div className="relative overflow-hidden rounded-[10px] bg-tertiary-200">
			<div className="grid grid-cols-1 gap-6 px-6 pt-8 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:py-10">
				{/* TEXT — mobile top, desktop LEFT */}
				<div className="relative z-10 max-w-xl">
					<h1 className="font-bold text-[24px] text-neutral-1000 leading-tight sm:text-[30px]">{title}</h1>
					<p className="mt-2 text-[14px] text-neutral-1000 leading-[21px]">{description}</p>
				</div>

				{/* VISUAL */}
				<div className="relative -mx-6 h-[110px] overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible">
					{/* Ellipse */}
					<div className="absolute top-10 right-4 bottom-0 size-[180px] rounded-full bg-tertiary-400 sm:top-2" />

					{/* Avatar */}
					<Image
						src="/avatar/subtest-header-avatar.webp"
						alt="Subtest Header Avatar"
						width={260}
						height={260}
						className="absolute right-0 size-[210px] -translate-y-10 select-none object-cover sm:bottom-0 sm:translate-y-1/2"
					/>
				</div>
			</div>
		</div>
	);
}

const subtestCardBackground = {
	pu: "bg-secondary-400",
	ppu: "bg-tertiary-400",
	pbm: "bg-fourtiary-300 *:text-white",
	pk: "bg-primary-200 *:text-white",
	lbi: "bg-secondary-400",
	lbing: "bg-tertiary-400",
	pm: "bg-fourtiary-300 *:text-white",
} as const;

const subtestCardPattern = {
	pu: "bg-secondary-600",
	ppu: "bg-tertiary-200",
	pbm: "bg-fourtiary-200",
	pk: "bg-primary-100",
	lbi: "bg-secondary-600",
	lbing: "bg-tertiary-200",
	pm: "bg-fourtiary-200",
} as const;

const subtestCardAvatar = {
	pu: "/avatar/subtest-pu-avatar.webp",
	ppu: "/avatar/subtest-ppu-avatar.webp",
	pbm: "/avatar/subtest-pbm-avatar.webp",
	pk: "/avatar/subtest-pk-avatar.webp",
	lbi: "/avatar/subtest-lbi-avatar.webp",
	lbing: "/avatar/subtest-lbing-avatar.webp",
	pm: "/avatar/subtest-pm-avatar.webp",
} as const;

type SubtestListItem = NonNullable<BodyOutputs["subtest"]["listSubtests"]>[number];

export function SubtestCard({
	subtest,
	userIsPremium,
	userRole,
}: {
	subtest: SubtestListItem;
	userIsPremium?: boolean;
	userRole?: string;
}) {
	const isAdmin = useIsAdmin();
	const shortName = subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
	const backgroundClass = subtestCardBackground[shortName] || "bg-secondary-400";
	const patternClass = subtestCardPattern[shortName] || "bg-secondary-600";
	const avatarSrc = subtestCardAvatar[shortName] || "/avatar/subtest-pu-avatar.webp";
	// Use subtest.order to determine if premium (order > 1 means premium)
	const isPremiumSubtest = isSubtestPremium(subtest?.order ?? 1, userRole, userIsPremium);
	const isLocked = !isAdmin && isPremiumSubtest;

	return (
		<Card className={cn(backgroundClass, "relative min-h-40 overflow-hidden border-0 p-4 transition-colors")}>
			{/* Lock overlay for premium content */}
			{isLocked && (
				<>
					{/* Dark overlay */}
					<div className="absolute inset-0 z-5 bg-black/40" />
					{/* Lock badge */}
					<div className="absolute top-4 left-4 z-10">
						<div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
							<LockKeyIcon size={16} className="text-white" weight="fill" />
							<span className="font-semibold text-white text-xs">Premium dulu yuk!</span>
						</div>
					</div>
				</>
			)}

			{/* Pattern element */}
			<div className={cn(patternClass, "absolute right-0 bottom-0 aspect-square h-[70%] w-auto")} />

			{/* Avatar image */}
			<div className="absolute right-13 bottom-0 aspect-square h-[170%] w-auto translate-x-1/2 translate-y-1/4">
				<Image
					src={avatarSrc}
					alt={`${subtest?.name} Avatar`}
					width={356}
					height={356}
					className="pointer-events-none select-none object-cover object-[50%_50%]"
				/>
			</div>
			<div className="flex h-full justify-between">
				<div className="mt-auto mb-0 w-1/2">
					<h3 className="text-pretty font-semibold">{subtest?.name}</h3>
					<p className="font-light text-sm"> {subtest?.totalContent} Konten</p>
				</div>

				{isLocked ? (
					// Disabled button for locked subtests
					<div
						className={cn(
							buttonVariants({ variant: "lightBlue", size: "icon" }),
							"z-10 mt-auto mb-0 cursor-not-allowed opacity-50",
						)}
					>
						<LockIcon size={18} weight="bold" />
					</div>
				) : (
					<Link
						to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
						params={{ shortName: subtest?.shortName?.toLowerCase() }}
						className={cn(buttonVariants({ variant: "lightBlue", size: "icon" }), "z-10 mt-auto mb-0")}
					>
						{isAdmin ? <PencilSimpleIcon size={18} weight="bold" /> : <ArrowRightIcon size={18} weight="bold" />}
					</Link>
				)}
			</div>
		</Card>
	);
}

export function ClassHeader({ subtest }: { subtest: SubtestListItem }) {
	const isAdmin = useIsAdmin();
	const shortName = subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
	const backgroundClass = subtestCardBackground[shortName] || "bg-secondary-400";
	const patternClass = subtestCardPattern[shortName] || "bg-secondary-600";
	const avatarSrc = subtestCardAvatar[shortName] || "/avatar/subtest-pu-avatar.webp";

	const forceTextWhite = backgroundClass.includes("text-white");

	return (
		<div className={cn(backgroundClass, "relative overflow-hidden rounded-[10px]")}>
			{/* Back button */}
			<div className="z-10 mt-6 ml-6 sm:mt-10 sm:ml-10">
				<BackButton to={isAdmin ? "/admin/classes" : "/classes"} />
			</div>

			<div className="grid grid-cols-1 px-6 pt-4 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:pb-10 md:grid-cols-5">
				{/* TEXT — mobile top, desktop LEFT */}
				<div className={cn("relative z-10 max-w-xl md:col-span-3", forceTextWhite && "text-white")}>
					<h1
						className={cn(
							"font-bold text-[24px] leading-tight sm:text-[30px]",
							forceTextWhite ? "text-white" : "text-neutral-1000",
						)}
					>
						{subtest?.name}
					</h1>
					<p className={cn("mt-2 text-[14px] leading-[21px]", forceTextWhite ? "text-white/90" : "text-neutral-1000")}>
						{subtest?.description}
					</p>
				</div>

				{/* VISUAL */}
				<div className="relative -mx-6 h-32.5 overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible md:col-span-2">
					{/* Ellipse */}
					<div className={cn(patternClass, "absolute top-15 right-4 bottom-0 size-45 rounded-full sm:top-2")} />

					{/* Avatar */}
					<Image
						src={avatarSrc}
						alt={`${subtest?.name} Avatar`}
						width={260}
						height={260}
						className="absolute right-0 size-70 translate-x-1/8 -translate-y-15 select-none object-cover sm:bottom-0 sm:left-0 sm:size-90 sm:translate-x-1/6 sm:translate-y-1/2 sm:translate-y-[55%] sm:object-cover"
					/>
				</div>
			</div>
		</div>
	);
}

type ContentListItem = NonNullable<BodyOutputs["subtest"]["listContentByCategory"]>[number];

type ContentActionItem = {
	hasVideo: boolean;
	hasNote: boolean;
	hasPracticeQuestions: boolean;
};

/**
 * Check if a content item is completed based on available components
 * A content is completed if all available components are completed
 */
function isContentCompleted(item: ContentListItem): boolean {
	const checks: boolean[] = [];

	// If has video, check if video is completed
	if (item.hasVideo) {
		checks.push(item.videoCompleted === true);
	}

	// If has note, check if note is completed
	if (item.hasNote) {
		checks.push(item.noteCompleted === true);
	}

	// If has practice questions, check if practice questions are completed
	if (item.hasPracticeQuestions) {
		checks.push(item.practiceQuestionsCompleted === true);
	}

	// Content is completed if all available components are completed
	// If no components available, return false
	return checks.length > 0 && checks.every(Boolean);
}

const CONTENT_ACTIONS = [
	{
		key: "video",
		label: "Video Materi",
		icon: PlayCircleIcon,
		enabled: (i: ContentActionItem) => i.hasVideo,
		className: "bg-primary-300 text-white",
		width: "w-fit",
	},
	{
		key: "notes",
		label: "Catatan Materi",
		icon: NoteIcon,
		enabled: (i: ContentActionItem) => i.hasNote,
		className: "bg-secondary-300 text-neutral-1000",
		width: "w-fit",
	},
	{
		key: "latihan-soal",
		label: "Latihan Soal",
		icon: ExamIcon,
		enabled: (i: ContentActionItem) => i.hasPracticeQuestions,
		className: "bg-tertiary-200 text-neutral-1000",
		width: "w-fit",
	},
] as const;

function ReorderableContentCard({
	item,
	index,
	onEdit,
	onDelete,
	completed,
}: {
	item: ContentListItem;
	index: number;
	onEdit?: () => void;
	onDelete?: () => void;
	completed?: boolean;
}) {
	const dragControls = useDragControls();

	return (
		<Reorder.Item value={item} dragListener={false} dragControls={dragControls} className="relative">
			<ContentCard
				item={item}
				index={index}
				onEdit={onEdit}
				onDelete={onDelete}
				completed={completed}
				dragControls={dragControls}
			/>
		</Reorder.Item>
	);
}

function ContentCard({
	item,
	index,
	onEdit,
	onDelete,
	completed,
	dragControls,
	userIsPremium,
	userRole,
	shortName,
	subtestOrder,
}: {
	item: ContentListItem;
	index: number;
	onEdit?: () => void;
	onDelete?: () => void;
	completed?: boolean;
	dragControls?: ReturnType<typeof useDragControls>;
	userIsPremium?: boolean;
	userRole?: string;
	shortName?: string;
	subtestOrder?: number;
}) {
	const isAdmin = useIsAdmin();
	const location = useLocation();
	const basePath = isAdmin ? "/admin/classes" : "/classes";
	const shortNameIndex = isAdmin ? 3 : 2;
	const subtestShortName = shortName || location.pathname.split("/")[shortNameIndex] || "";
	// Use canAccessContent to determine if this content is premium locked
	// item.order is the content order (1-based), subtestOrder is the subtest order
	const isPremiumContent =
		!isAdmin && !canAccessContent(userIsPremium ?? false, userRole, subtestOrder ?? 1, item.order);

	const params = {
		shortName: subtestShortName,
		contentId: item.id.toString(),
	};

	return (
		<Card
			className={cn(
				"relative gap-1 rounded-[10px] border border-neutral-200 p-3 sm:gap-6 sm:p-4 lg:p-5",
				!isAdmin && completed && "border-tertiary-300 bg-tertiary-100",
				isPremiumContent && "overflow-hidden",
			)}
		>
			{/* Premium lock overlay */}
			{isPremiumContent && (
				<>
					{/* Dark overlay */}
					<div className="pointer-events-none absolute inset-0 z-10 bg-black/50" />
					{/* Lock badge */}
					<div className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">
						<div className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
							<LockIcon className="size-4 text-white" weight="fill" />
							<span className="font-semibold text-white text-xs">Premium</span>
						</div>
					</div>
				</>
			)}

			{/* Completed indicator */}
			{!isAdmin && completed && !isPremiumContent && (
				<div className="absolute top-2 right-2 sm:top-3 sm:right-3">
					<CheckCircleIcon className="size-5 text-fourtiary-300 sm:size-6" weight="fill" />
				</div>
			)}

			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				{/* Left: drag handle + badge + title */}
				<div className="flex items-start gap-2 sm:gap-3">
					{/* Drag Handle - only for admin */}
					{isAdmin && dragControls && (
						<div
							className="-ml-1 cursor-grab touch-none p-1 active:cursor-grabbing"
							onPointerDown={(e) => dragControls.start(e)}
						>
							<DotsNineIcon className="size-4 text-neutral-400 sm:size-5" weight="bold" />
						</div>
					)}

					<div className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded border border-neutral-200 bg-white px-1.5 sm:h-6 sm:min-w-8 lg:h-7 lg:min-w-9">
						<p className="whitespace-nowrap font-medium text-[10px] text-primary-300 sm:text-xs lg:text-sm">
							{index + 1}
						</p>
					</div>

					<p className="mr-7 font-medium text-neutral-1000 text-sm sm:text-base lg:text-lg">{item.title}</p>
				</div>

				{/* Right: admin actions (tanpa move up/down) */}
				<div className="flex items-center gap-2 sm:flex-col sm:items-end">
					{isAdmin && (onEdit || onDelete) && (
						<div className="flex items-center gap-1">
							{onEdit && (
								<Button type="button" variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={onEdit}>
									<PencilSimpleIcon className="size-3 sm:size-3.5 lg:size-5" />
								</Button>
							)}

							{onDelete && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-destructive hover:text-destructive sm:h-7 sm:w-7"
									onClick={onDelete}
								>
									<TrashIcon className="size-3 sm:size-3.5 lg:size-5" />
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Actions - Links still work but will be caught by route guard */}
			<div className="flex gap-2 overflow-x-auto sm:gap-3">
				{CONTENT_ACTIONS.map(
					({ key, label, icon: Icon, enabled, className, width }) =>
						enabled(item) && (
							<Link
								key={key}
								to={`${basePath}/$shortName/$contentId/${key}`}
								params={params}
								className={cn(
									"flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-opacity hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5",
									"w-full sm:w-auto",
									className,
									width,
									isPremiumContent && "pointer-events-none opacity-60",
								)}
							>
								<Icon className="size-4 sm:size-[18px]" weight="bold" />
								<span className="whitespace-nowrap font-medium text-xs sm:text-[14px]">{label}</span>
								<CaretRightIcon className="ml-auto size-4 sm:size-[18px]" weight="bold" />
							</Link>
						),
				)}
			</div>
		</Card>
	);
}

type LastContentViewedItem = ContentActionItem & {
	id: number;
	title: string;
};

type ContentFilter = "all" | "material" | "tips_and_trick";

const FILTERS: { value: ContentFilter; label: string }[] = [
	{ value: "all", label: "Semua" },
	{ value: "material", label: "Materi" },
	{ value: "tips_and_trick", label: "Tips & Trick" },
];

export function ContentFilters({
	activeFilter,
	onChange,
}: {
	activeFilter: ContentFilter;
	onChange: (filter: ContentFilter) => void;
}) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
			{FILTERS.map((filter) => (
				<button
					key={filter.value}
					type="button"
					onClick={() => onChange(filter.value)}
					className={cn(
						"whitespace-nowrap rounded-lg border px-3 py-2 font-normal text-xs transition-all",
						"sm:h-10",
						"border-primary-300 bg-white text-primary-300",
						"hover:bg-primary-50",
						activeFilter === filter.value && "bg-primary-300 text-white",
					)}
				>
					{filter.label}
				</button>
			))}
		</div>
	);
}

export function LastContentViewedCard({
	item,
	index,
	shortName: shortNameProp,
}: {
	item: LastContentViewedItem;
	index: number;
	shortName?: string;
}) {
	const isAdmin = useIsAdmin();
	const location = useLocation();
	const basePath = isAdmin ? "/admin/classes" : "/classes";
	const shortNameIndex = isAdmin ? 3 : 2;
	const shortNameFromPath = location.pathname.split("/")[shortNameIndex] || "";
	const shortName = shortNameProp || shortNameFromPath;

	const params = {
		shortName: shortName.toLowerCase(),
		contentId: item.id.toString(),
	};

	return (
		<Card className="rounded-[10px] border border-neutral-200 p-4 sm:p-5">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				{/* Left: badge + title */}
				<div className="flex items-start gap-3">
					<div className="flex h-7 w-8 shrink-0 items-center justify-center rounded border border-neutral-200">
						<p className="font-medium text-[12px] text-primary-300">{index + 1}</p>
					</div>

					<p className="font-medium text-[18px] text-neutral-1000 sm:text-[20px]">{item.title}</p>
				</div>

				{/* Right: label + admin actions */}
				<div className="flex items-center gap-2 sm:flex-col sm:items-end">
					{shortName && <span className="text-muted-foreground text-xs">{shortName}</span>}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-3 overflow-x-auto">
				{CONTENT_ACTIONS.map(
					({ key, label, icon: Icon, enabled, className, width }) =>
						enabled(item) && (
							<Link
								key={key}
								to={`${basePath}/$shortName/$contentId/${key}`}
								params={params}
								className={cn(
									"flex items-center gap-2 rounded-[5px] px-4 py-2.5 transition-opacity hover:opacity-90",
									"w-full sm:w-auto",
									className,
									width,
								)}
							>
								<Icon size={18} weight="bold" />
								<span className="whitespace-nowrap font-medium text-[14px]">{label}</span>
								<CaretRightIcon size={18} className="ml-auto" weight="bold" />
							</Link>
						),
				)}
			</div>
		</Card>
	);
}

export function ContentList({
	title,
	items,
	isLoading,
	error,
	onCreate,
	onEdit,
	onDelete,
	onReorder,
	userIsPremium,
	userRole,
	shortName,
	subtestOrder,
	searchQuery,
	showCount,
	hasMore,
	onLoadMore,
}: {
	title?: string;
	items?: ContentListItem[];
	isLoading?: boolean;
	error?: string;
	onCreate?: () => void;
	onEdit?: (item: ContentListItem) => void;
	onDelete?: (item: ContentListItem) => void;
	onReorder?: (newItems: ContentListItem[]) => void;
	userIsPremium?: boolean;
	userRole?: string;
	shortName?: string;
	subtestOrder?: number;
	searchQuery?: string;
	showCount?: boolean;
	hasMore?: boolean;
	onLoadMore?: () => void;
}) {
	const isAdmin = useIsAdmin();
	const [localItems, setLocalItems] = useState<ContentListItem[]>([]);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (items) {
			setLocalItems(items);
		}
	}, [items]);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const handleReorder = (newItems: ContentListItem[]) => {
		setLocalItems(newItems);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			if (onReorder) {
				onReorder(newItems);
			}
		}, 800);
	};

	return (
		<div className="">
			<div className="flex items-center justify-between">
				{title && <h3 className="font-semibold text-lg">{title}</h3>}
				{isAdmin && onCreate && (
					<Button type="button" variant="destructive" size="sm" onClick={onCreate}>
						<PlusIcon size={16} className="mr-2" weight="bold" />
						Tambah Konten
					</Button>
				)}
				{isLoading && !title && <p className="text-muted-foreground text-xs">Memuat...</p>}
			</div>

			{showCount && searchQuery && items && (
				<p className="text-muted-foreground text-sm">
					{items.length} hasil untuk "{searchQuery}"
				</p>
			)}

			{error && <p className="text-red-500 text-sm">{error}</p>}

			{!isLoading && !error && (!localItems || localItems.length === 0) && (
				<div className="flex flex-col items-center justify-center gap-2">
					<Image src="/avatar/confused-avatar.webp" alt="Empty State" width={150} height={150} />
					<p>Tunggu kontennya diracik dulu ya!</p>
				</div>
			)}

			{localItems &&
				localItems.length > 0 &&
				(isAdmin && onReorder ? (
					<Reorder.Group as="div" axis="y" values={localItems} onReorder={handleReorder} className="space-y-2">
						{localItems.map((item, index) => (
							<ReorderableContentCard
								key={item.id}
								item={item}
								index={index}
								onEdit={onEdit ? () => onEdit(item) : undefined}
								onDelete={onDelete ? () => onDelete(item) : undefined}
							/>
						))}
					</Reorder.Group>
				) : (
					<div className="space-y-2">
						{localItems.map((item, index) => (
							<ContentCard
								key={item.id}
								item={item}
								index={index}
								completed={isContentCompleted(item)}
								onEdit={onEdit ? () => onEdit(item) : undefined}
								onDelete={onDelete ? () => onDelete(item) : undefined}
								userIsPremium={userIsPremium}
								userRole={userRole}
								shortName={shortName}
								subtestOrder={subtestOrder}
							/>
						))}
					</div>
				))}

			{hasMore && onLoadMore && (
				<div className="flex justify-center pt-4">
					<Button type="button" variant="outline" onClick={onLoadMore}>
						Muat Lebih Banyak
					</Button>
				</div>
			)}
		</div>
	);
}

export function PracticeQuestionHeader({ content }: { content: string }) {
	return (
		<div className="relative overflow-hidden bg-tertiary-200">
			{/* Ellipse background (dekoratif): center vertically, stick to the right, with some overflow */}
			<div
				className="absolute top-1/2 right-[-50px] size-[181px] -translate-y-1/2 rounded-full bg-tertiary-400"
				style={{ zIndex: 0 }}
			/>

			{/* Main content (penentu height) */}
			<div className="relative flex items-center gap-6 px-6 py-4" style={{ zIndex: 1 }}>
				<h1 className="font-medium text-neutral-1000 text-xl">{content}</h1>
			</div>
		</div>
	);
}

export function AnswerCollapsible({
	children,
	title = "Jawaban",
	defaultOpen = false,
}: {
	children: React.ReactNode;
	title?: string;
	defaultOpen?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="group flex items-center gap-2 transition-opacity hover:opacity-80">
				<p className="font-medium">{title}</p>
				{isOpen ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="size-4" />}
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2 overflow-hidden">
				<m.div
					initial={{ opacity: 0, y: -10 }}
					animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
				>
					{children}
				</m.div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function PracticeQuestion({
	questionNumber,
	totalQuestions,
	question,
	answer,
	answerTitle = "Jawaban",
}: {
	questionNumber: number;
	totalQuestions: number;
	question: React.ReactNode;
	answer: React.ReactNode;
	answerTitle?: string;
}) {
	return (
		<div className="space-y-4">
			{/* Soal */}
			<div className="flex flex-col rounded-md border border-neutral-200 p-4">
				<div className="flex space-x-4">
					<div className="w-fit rounded-sm border border-neutral-200 px-4 py-2">Soal</div>
					<div className="w-fit rounded-sm border border-neutral-200 px-4 py-2">
						{questionNumber}/{totalQuestions}
					</div>
				</div>
				<div>{question}</div>
			</div>

			{/* Jawaban */}
			<AnswerCollapsible title={answerTitle}>
				<div className="text-muted-foreground text-sm">{answer}</div>
			</AnswerCollapsible>
		</div>
	);
}
