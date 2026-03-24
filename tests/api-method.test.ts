import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("HTTP methods", () => {
	test("stats only responds to GET", async () => {
		expect((await app.request("/api/stats")).status).toBe(200);
		expect((await app.request("/api/stats", { method: "POST" })).status).toBe(404);
	});

	test("upload only responds to POST", async () => {
		expect((await app.request("/api/upload")).status).toBe(404);
	});
});
