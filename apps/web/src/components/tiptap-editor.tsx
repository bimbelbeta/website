import {
	CodeIcon,
	ImageIcon,
	LinkSimpleIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	QuotesIcon,
	TextAlignCenterIcon,
	TextAlignLeftIcon,
	TextAlignRightIcon,
	TextBIcon,
	TextHOneIcon,
	TextHThreeIcon,
	TextHTwoIcon,
	TextItalicIcon,
	TextStrikethroughIcon,
	TextUnderlineIcon,
} from "@phosphor-icons/react";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import "./tiptap-styles.css";

interface TiptapEditorProps {
	content?: unknown;
	onChange?: (content: object) => void;
	className?: string;
}

function TiptapEditorInner({ content, onChange, className }: TiptapEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Highlight,
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-blue-600 underline hover:text-blue-800",
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: "max-w-full h-auto rounded-lg",
				},
			}),
		],
		editable: true,
		content: content as object,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getJSON());
		},
	});

	useEffect(() => {
		if (editor && content) {
			editor.commands.setContent(content as object);
		}
	}, [editor, content]);

	if (!editor) {
		return (
			<div className={className}>
				<div className="mb-4 flex flex-wrap gap-2 rounded-md border border-input bg-background p-2">
					{/* Placeholder toolbar */}
				</div>
				<div className="min-h-[300px] rounded-md border border-input bg-background p-4">
					<p className="text-muted-foreground text-sm">Memuat editor...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			{/* Toolbar */}
			<div className="mb-4 flex flex-wrap gap-2 rounded-md border border-input bg-background p-2">
				{/* Text Formatting */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "bg-muted" : ""}
				>
					<TextBIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "bg-muted" : ""}
				>
					<TextItalicIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className={editor.isActive("underline") ? "bg-muted" : ""}
				>
					<TextUnderlineIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={editor.isActive("strike") ? "bg-muted" : ""}
				>
					<TextStrikethroughIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={editor.isActive("code") ? "bg-muted" : ""}
				>
					<CodeIcon size={18} />
				</Button>

				<div className="mx-1 h-6 w-px bg-border" />

				{/* Headings */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
				>
					<TextHOneIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
				>
					<TextHTwoIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
				>
					<TextHThreeIcon size={18} />
				</Button>

				<div className="mx-1 h-6 w-px bg-border" />

				{/* Lists */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "bg-muted" : ""}
				>
					<ListBulletsIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "bg-muted" : ""}
				>
					<ListNumbersIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editor.isActive("blockquote") ? "bg-muted" : ""}
				>
					<QuotesIcon size={18} />
				</Button>

				<div className="mx-1 h-6 w-px bg-border" />

				{/* Alignment */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
				>
					<TextAlignLeftIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
				>
					<TextAlignCenterIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
				>
					<TextAlignRightIcon size={18} />
				</Button>

				<div className="mx-1 h-6 w-px bg-border" />

				{/* Link & Image */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => {
						const url = window.prompt("Enter URL:");
						if (url) {
							editor.chain().focus().setLink({ href: url }).run();
						}
					}}
					className={editor.isActive("link") ? "bg-muted" : ""}
				>
					<LinkSimpleIcon size={18} />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => {
						const url = window.prompt("Enter image URL:");
						if (url) {
							editor.chain().focus().setImage({ src: url }).run();
						}
					}}
				>
					<ImageIcon size={18} />
				</Button>
			</div>

			{/* Editor Content */}
			<div className="min-h-[300px] rounded-md border border-input bg-background p-4">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}

export function TiptapEditor(props: TiptapEditorProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Only render the editor on the client side to avoid SSR issues
	if (!isMounted || typeof window === "undefined") {
		return (
			<div className={props.className}>
				<div className="mb-4 flex flex-wrap gap-2 rounded-md border border-input bg-background p-2">
					{/* Placeholder toolbar */}
				</div>
				<div className="min-h-[300px] rounded-md border border-input bg-background p-4">
					<p className="text-muted-foreground text-sm">Memuat editor...</p>
				</div>
			</div>
		);
	}

	return <TiptapEditorInner {...props} />;
}
