import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

const app = new Hono();
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

describe("Health endpoint", () => {
	test("returns 200 with status ok", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.status).toBe("ok");
		expect(json.version).toBe("0.1.0");
	});

	test("returns JSON content type", async () => {
		const res = await app.request("/health");
		expect(res.headers.get("content-type")).toContain("application/json");
	});
});
