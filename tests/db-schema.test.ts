import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { db } = await import("../src/services/db");

describe("DB schema", () => {
	test("drops table exists", () => {
		const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='drops'").get();
		expect(result).toBeTruthy();
	});

	test("drops table has expected columns", () => {
		const cols = db.prepare("PRAGMA table_info(drops)").all();
		const names = (cols as Array<{name: string}>).map(c => c.name);
		expect(names).toContain("id");
		expect(names).toContain("root_hash");
		expect(names).toContain("file_name");
		expect(names).toContain("downloads");
	});
});
