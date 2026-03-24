import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("Upload validation shapes", () => {
	test("missing file returns error with message", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json).toHaveProperty("error");
		expect(json.error.length).toBeGreaterThan(5);
	});

	test("empty file returns specific error", async () => {
		const formData = new FormData();
		formData.append("file", new File([], "empty.txt"));
		const res = await app.request("/api/upload", { method: "POST", body: formData });
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("empty");
	});
});
