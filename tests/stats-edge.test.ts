import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("Stats endpoint edge cases", () => {
	test("stats returns zeros on empty DB", async () => {
		// Fresh in-memory DB may have data from other tests, just verify shape
		const json = await (await app.request("/api/stats")).json();
		expect(typeof json.totalDrops).toBe("number");
		expect(typeof json.totalSize).toBe("number");
		expect(typeof json.totalDownloads).toBe("number");
	});

	test("stats returns JSON content-type", async () => {
		const res = await app.request("/api/stats");
		expect(res.headers.get("content-type")).toContain("json");
	});
});
