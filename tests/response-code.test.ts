import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const app = new Hono();
app.route("/api", dropRouter);

describe("HTTP response codes", () => {
	test("stats returns 200", async () => {
		expect((await app.request("/api/stats")).status).toBe(200);
	});

	test("missing drop returns 404", async () => {
		expect((await app.request("/api/missing/info")).status).toBe(404);
	});

	test("no file upload returns 400", async () => {
		expect((await app.request("/api/upload", { method: "POST" })).status).toBe(400);
	});
});
