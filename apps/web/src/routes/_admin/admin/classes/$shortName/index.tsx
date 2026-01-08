import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
import { toast } from "sonner";
import { ClassHeader, ContentFilters, ContentList } from "@/components/classes";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Container } from "@/components/ui/container";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import type { BodyOutputs } from "@/utils/orpc";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/classes/$shortName/")({
	params: {
		parse: (raw) => ({
			shortName: raw.shortName?.toLowerCase(),
		}),
	},
	component: RouteComponent,
});

type ContentListItem = NonNullable<BodyOutputs["subtest"]["listContentByCategory"]>[number];

type Search = {
	q?: string;
	category?: "material" | "tips_and_trick" | undefined;
	page?: number;
};

function RouteComponent() {
	const { shortName } = Route.useParams();
	const queryClient = useQueryClient();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [createDialogType, setCreateDialogType] = useState<"material" | "tips_and_trick">("material");
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ContentListItem | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingItem, setDeletingItem] = useState<ContentListItem | null>(null);

	const searchParams = Route.useSearch();
	const searchQuery = (searchParams as Search).q ?? "";
	const activeFilter: "all" | "material" | "tips_and_trick" = (searchParams as Search).category ?? "all";
	const page = (searchParams as Search).page ?? 0;

	const navigate = Route.useNavigate();
	const updateSearch = (updates: Partial<Search>) => {
		const newSearch: Partial<Search> = {};

		if (updates.q !== undefined) {
			newSearch.q = updates.q || undefined;
		}
		if (updates.category !== undefined) {
			newSearch.category = updates.category || undefined;
		}
		if (updates.page !== undefined) {
			newSearch.page = updates.page;
		}

		if (
			(updates.q !== undefined && updates.q !== (searchParams as Search).q) ||
			(updates.category !== undefined && updates.category !== (searchParams as Search).category)
		) {
			newSearch.page = 0;
		}

		// Remove undefined values to avoid ?category=undefined in URL
		const cleanSearch = Object.fromEntries(Object.entries(newSearch).filter(([, value]) => value !== undefined));

		navigate({ search: cleanSearch });
	};

	const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());
	const matchedClass = subtests.data?.find((item) => item.shortName?.toLowerCase() === shortName);

	const contents = useQuery(
		orpc.subtest.listContentByCategory.queryOptions({
			input: (() => {
				const input: {
					subtestId: number;
					category?: "material" | "tips_and_trick";
					search?: string;
					limit: number;
					offset: number;
				} = {
					subtestId: matchedClass?.id ?? 0,
					limit: 20,
					offset: page * 20,
				};
				if (activeFilter !== "all") {
					input.category = activeFilter as "material" | "tips_and_trick";
				}
				if (searchQuery) {
					input.search = searchQuery;
				}
				return input;
			})(),
			enabled: Boolean(matchedClass?.id),
		}),
	);

	const createMutation = useMutation(
		orpc.admin.subtest.createContent.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					predicate: (query) => {
						return query.queryKey[0] === "subtest.listContentByCategory";
					},
				});
				setCreateDialogOpen(false);
			},
			onError: (error) => {
				toast.error(error.message || "Gagal membuat konten");
			},
		}),
	);

	const updateMutation = useMutation(
		orpc.admin.subtest.updateContent.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					predicate: (query) => {
						return query.queryKey[0] === "subtest.listContentByCategory";
					},
				});
				setEditDialogOpen(false);
				setEditingItem(null);
			},
			onError: (error) => {
				toast.error(error.message || "Gagal memperbarui konten");
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.admin.subtest.deleteContent.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					predicate: (query) => {
						return query.queryKey[0] === "subtest.listContentByCategory";
					},
				});
				setDeleteDialogOpen(false);
				setDeletingItem(null);
			},
			onError: (error) => {
				toast.error(error.message || "Gagal menghapus konten");
			},
		}),
	);

	const reorderMutation = useMutation(
		orpc.admin.subtest.reorderContent.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					predicate: (query) => {
						return query.queryKey[0] === "subtest.listContentByCategory";
					},
				});
			},
			onError: (error) => {
				toast.error(error.message || "Gagal mengubah urutan konten");
			},
		}),
	);

	const createForm = useForm({
		defaultValues: {
			title: "",
			withNote: true,
		},
		onSubmit: async ({ value }) => {
			if (!matchedClass) return;
			const items = contents.data;
			const maxOrder = items && items.length > 0 ? Math.max(...items.map((i) => i.order ?? 0)) : 0;

			if (!value.withNote) {
				toast.error("Konten baru harus memiliki minimal satu komponen. Aktifkan catatan materi.");
				return;
			}

			createMutation.mutate({
				subtestId: matchedClass.id,
				type: createDialogType,
				title: value.title,
				order: maxOrder + 1,
				note: value.withNote ? { content: {} } : undefined,
			});
		},
		validators: {
			onSubmit: type({
				title: "string >= 1",
			}),
		},
	});

	const editForm = useForm({
		defaultValues: {
			title: "",
		},
		onSubmit: async ({ value }) => {
			if (!editingItem) return;
			updateMutation.mutate({
				id: editingItem.id,
				title: value.title,
			});
		},
		validators: {
			onSubmit: type({
				title: "string >= 1",
			}),
		},
	});

	const handleCreate = (type: "material" | "tips_and_trick") => {
		setCreateDialogType(type);
		setCreateDialogOpen(true);
		createForm.reset();
	};

	const handleEdit = (item: ContentListItem) => {
		setEditingItem(item);
		editForm.setFieldValue("title", item.title);
		setEditDialogOpen(true);
	};

	const handleDelete = (item: ContentListItem) => {
		setDeletingItem(item);
		setDeleteDialogOpen(true);
	};

	const handleReorder = (newItems: ContentListItem[]) => {
		if (!matchedClass || newItems.length === 0) return;

		let category: "material" | "tips_and_trick";
		if (activeFilter === "all") {
			// Disable reordering when filter is "all" - types could be mixed
			return;
		}
		category = activeFilter;

		const updatedItems = newItems.map((item, index) => ({
			id: item.id,
			order: index + 1,
		}));

		reorderMutation.mutate({
			subtestId: matchedClass.id,
			type: category,
			items: updatedItems,
		});
	};

	if (subtests.isPending) {
		return (
			<div className="mx-auto max-w-6xl">
				<Container className="pt-12">
					<p className="animate-pulse text-sm">Memuat kelas...</p>
				</Container>
			</div>
		);
	}

	if (subtests.isError) {
		return (
			<div className="mx-auto max-w-6xl">
				<Container className="pt-12">
					<p className="text-red-500 text-sm">Error: {subtests.error.message}</p>
				</Container>
			</div>
		);
	}
	if (!matchedClass) return notFound();

	return (
		<Container className="py-0">
			<ClassHeader subtest={matchedClass} />
			<div className="sticky top-0 z-10 space-y-4 border-b bg-background/95 pb-4 backdrop-blur">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="w-full flex-1 sm:max-w-md">
						<SearchInput value={searchQuery} onChange={(q) => updateSearch({ q })} placeholder="Cari konten..." />
					</div>
					<ContentFilters
						activeFilter={activeFilter}
						onChange={(category) =>
							updateSearch({ category: category === "all" ? undefined : (category as "material" | "tips_and_trick") })
						}
					/>
				</div>
			</div>

			<div className="space-y-4">
				<ContentList
					items={contents.data}
					isLoading={contents.isPending}
					error={contents.isError ? contents.error.message : undefined}
					searchQuery={searchQuery}
					showCount={Boolean(searchQuery)}
					hasMore={contents.data?.length === 20}
					onLoadMore={() => updateSearch({ page: page + 1 })}
					onCreate={() =>
						handleCreate(activeFilter === "all" ? "material" : (activeFilter as "material" | "tips_and_trick"))
					}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onReorder={handleReorder}
				/>
			</div>

			{/* Create Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tambah Konten</DialogTitle>
						<DialogDescription>
							Buat konten baru untuk {createDialogType === "material" ? "Materi" : "Tips & Trick"}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createForm.handleSubmit();
						}}
						className="space-y-4"
					>
						<createForm.Field name="title">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Judul</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Masukkan judul konten"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500 text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</createForm.Field>
						<createForm.Field name="withNote">
							{(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
									/>
									<Label htmlFor={field.name} className="font-normal text-sm">
										Buat catatan materi awal (minimal satu komponen per konten)
									</Label>
								</div>
							)}
						</createForm.Field>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
								Batal
							</Button>
							<createForm.Subscribe>
								{(state) => (
									<Button type="submit" disabled={!state.canSubmit || createMutation.isPending}>
										{createMutation.isPending ? "Menyimpan..." : "Simpan"}
									</Button>
								)}
							</createForm.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Konten</DialogTitle>
						<DialogDescription>Ubah judul konten</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							editForm.handleSubmit();
						}}
						className="space-y-4"
					>
						<editForm.Field name="title">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Judul</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Masukkan judul konten"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500 text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</editForm.Field>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setEditDialogOpen(false);
									setEditingItem(null);
								}}
							>
								Batal
							</Button>
							<editForm.Subscribe>
								{(state) => (
									<Button type="submit" disabled={!state.canSubmit || updateMutation.isPending}>
										{updateMutation.isPending ? "Menyimpan..." : "Simpan"}
									</Button>
								)}
							</editForm.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Konten?</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus konten "{deletingItem?.title}
							"? Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingItem) {
									deleteMutation.mutate({ id: deletingItem.id });
								}
							}}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Menghapus..." : "Hapus"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Container>
	);
}
