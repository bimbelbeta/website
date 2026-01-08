import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { clearSubtest, seedSubtest } from "./subtest.seed";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({
	path: resolve(__dirname, "../../../../apps/server/.env"),
	quiet: true,
});

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is required");
	}

	if (process.env.NODE_ENV === "production") {
		throw new Error("Cannot run seed script in production");
	}

	console.log("Starting seed...");

	const db = drizzle(process.env.DATABASE_URL);

	// await clearPractice(db);
	await clearSubtest(db);
	await seedSubtest(db);
	// await seedPractice(db);

	console.log("Seed completed");

	process.exit(0);
}

main().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
