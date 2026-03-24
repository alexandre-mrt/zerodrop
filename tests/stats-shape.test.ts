import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("Stats shape", () => {
	test("has exactly 3 fields", async () => {
		const json = await (await app.request("/api/stats")).json();
		expect(Object.keys(json).length).toBe(3);
	});
	test("all values are numbers", async () => {
		const json = await (await app.request("/api/stats")).json();
		for (const v of Object.values(json)) {
			expect(typeof v).toBe("number");
		}
	});
});
