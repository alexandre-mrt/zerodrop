import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { db } = await import("../src/services/db");

describe("DB indexes", () => {
	test("has index on drops.id", () => {
		const indexes = db.prepare("PRAGMA index_list(drops)").all();
		expect((indexes as any[]).length).toBeGreaterThan(0);
	});

	test("journal mode is set", () => {
		const result = db.prepare("PRAGMA journal_mode").get() as { journal_mode: string };
		expect(["wal","memory"]).toContain(result.journal_mode);
	});
});
