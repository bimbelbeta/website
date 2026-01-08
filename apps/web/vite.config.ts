import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: Number(process.env.PORT || 3000),
	},
	plugins: [
		tsconfigPaths(),
		tanstackStart(),
		viteReact(),
		process.env.NODE_ENV === "production" &&
			nitro({
				vercel: {
					functions: {
						runtime: "bun1.x",
					},
				},
			}),
		tailwindcss(),
	],
});
