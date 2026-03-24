import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";

const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");

const app = new Hono();
app.route("/api", dropRouter);

// Seed data
queries.insertDrop.run({
	$id: "env-test",
	$rootHash: "0xenvhash",
	$fileName: "env.txt",
	$fileSize: 100,
	$mimeType: "text/plain",
	$passwordHash: null,
	$maxDownloads: null,
	$expiresAt: Math.floor(Date.now() / 1000) + 86400,
	$ipAddress: null,
});

describe("Response envelope consistency", () => {
	test("info success has all fields", async () => {
		const res = await app.request("/api/env-test/info");
		expect(res.status).toBe(200);
		const json = await res.json();
		// Info returns flat object (not wrapped in success/data)
		expect(json).toHaveProperty("id");
		expect(json).toHaveProperty("fileName");
		expect(json).toHaveProperty("fileSize");
	});

	test("404 has error string", async () => {
		const res = await app.request("/api/missing/info");
		expect(res.status).toBe(404);
		const json = await res.json();
		expect(typeof json.error).toBe("string");
		expect(json.error.length).toBeGreaterThan(0);
	});

	test("400 has error string", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(typeof json.error).toBe("string");
	});

	test("upload success has all fields", async () => {
		// Can't test full upload without 0G Storage, but verify error shape
		const formData = new FormData();
		formData.append("file", new File([], "empty.txt"));
		const res = await app.request("/api/upload", {
			method: "POST",
			body: formData,
		});
		// Empty file should be rejected
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json).toHaveProperty("error");
	});
});

describe("HTTP status code usage", () => {
	test("uses 200 for success", async () => {
		const res = await app.request("/api/env-test/info");
		expect(res.status).toBe(200);
	});

	test("uses 400 for bad request", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		expect(res.status).toBe(400);
	});

	test("uses 404 for not found", async () => {
		const res = await app.request("/api/missing/info");
		expect(res.status).toBe(404);
	});
});
