import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "./tiptap-styles.css";

interface TiptapRendererProps {
	content: unknown;
	className?: string;
}

export function TiptapRenderer({ content, className }: TiptapRendererProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Highlight,
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Link.configure({
				openOnClick: true,
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
		editable: false,
		content: content as object,
	});

	useEffect(() => {
		if (editor && content) {
			editor.commands.setContent(content as object);
		}
	}, [editor, content]);

	if (!editor) {
		return null;
	}

	return (
		<div className={className}>
			<EditorContent editor={editor} />
		</div>
	);
}
