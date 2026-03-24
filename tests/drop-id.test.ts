import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("Drop ID validation in routes", () => {
	test("info rejects ID over 30 chars", async () => {
		const res = await app.request(`/api/${"x".repeat(31)}/info`);
		expect(res.status).toBe(400);
	});

	test("download rejects ID over 30 chars", async () => {
		const res = await app.request(`/api/${"x".repeat(31)}/download`);
		expect(res.status).toBe(400);
	});

	test("info accepts 10-char ID format", async () => {
		const res = await app.request("/api/abcdef1234/info");
		// 404 is fine (doesn't exist), just not 400
		expect(res.status).toBe(404);
	});
});
