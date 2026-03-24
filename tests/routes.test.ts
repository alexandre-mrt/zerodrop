import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";

const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");

const app = new Hono();
app.route("/api", dropRouter);

// Seed a test drop directly in DB (skip 0G storage upload)
queries.insertDrop.run({
	$id: "test-abc",
	$rootHash: "0xtesthash",
	$fileName: "hello.txt",
	$fileSize: 1024,
	$mimeType: "text/plain",
	$passwordHash: null,
	$maxDownloads: 5,
	$expiresAt: Math.floor(Date.now() / 1000) + 86400,
	$ipAddress: "127.0.0.1",
});

// Seed a password-protected drop
const { createHash } = await import("node:crypto");
const pwHash = createHash("sha256").update("secret123").digest("hex");
queries.insertDrop.run({
	$id: "pw-test",
	$rootHash: "0xpwhash",
	$fileName: "secret.pdf",
	$fileSize: 5000,
	$mimeType: "application/pdf",
	$passwordHash: pwHash,
	$maxDownloads: null,
	$expiresAt: null,
	$ipAddress: null,
});

// Seed an expired drop
queries.insertDrop.run({
	$id: "expired-test",
	$rootHash: "0xexpired",
	$fileName: "old.txt",
	$fileSize: 100,
	$mimeType: "text/plain",
	$passwordHash: null,
	$maxDownloads: null,
	$expiresAt: Math.floor(Date.now() / 1000) - 3600,
	$ipAddress: null,
});

describe("GET /api/:id/info", () => {
	test("returns drop info", async () => {
		const res = await app.request("/api/test-abc/info");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.fileName).toBe("hello.txt");
		expect(json.fileSize).toBe(1024);
		expect(json.hasPassword).toBe(false);
		expect(json.downloads).toBe(0);
		expect(json.maxDownloads).toBe(5);
	});

	test("info includes all expected fields", async () => {
		const res = await app.request("/api/test-abc/info");
		const json = await res.json();
		expect(json).toHaveProperty("id");
		expect(json).toHaveProperty("fileName");
		expect(json).toHaveProperty("fileSize");
		expect(json).toHaveProperty("mimeType");
		expect(json).toHaveProperty("hasPassword");
		expect(json).toHaveProperty("downloads");
		expect(json).toHaveProperty("maxDownloads");
		expect(json).toHaveProperty("expiresAt");
		expect(json).toHaveProperty("createdAt");
		expect(json.mimeType).toBe("text/plain");
	});

	test("returns 404 for nonexistent", async () => {
		const res = await app.request("/api/nonexistent/info");
		expect(res.status).toBe(404);
	});

	test("returns 410 for expired drop", async () => {
		const res = await app.request("/api/expired-test/info");
		expect(res.status).toBe(410);
	});

	test("returns 400 for overly long drop ID", async () => {
		const res = await app.request(`/api/${"a".repeat(50)}/info`);
		expect(res.status).toBe(400);
	});

	test("shows hasPassword=true for protected drops", async () => {
		const res = await app.request("/api/pw-test/info");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.hasPassword).toBe(true);
	});
});

describe("GET /api/:id/download", () => {
	test("returns 404 for nonexistent", async () => {
		const res = await app.request("/api/nonexistent/download");
		expect(res.status).toBe(404);
	});

	test("returns 410 for expired drop", async () => {
		// Insert fresh expired drop (previous one may have been cleaned)
		queries.insertDrop.run({
			$id: "expired-dl",
			$rootHash: "0xexpired2",
			$fileName: "old2.txt",
			$fileSize: 50,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: Math.floor(Date.now() / 1000) - 3600,
			$ipAddress: null,
		});
		const res = await app.request("/api/expired-dl/download");
		expect(res.status).toBe(410);
	});

	test("returns 401 for password-protected drop without password", async () => {
		const res = await app.request("/api/pw-test/download");
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json.error).toContain("password");
	});

	test("returns 401 for wrong password", async () => {
		const res = await app.request("/api/pw-test/download?password=wrong");
		expect(res.status).toBe(401);
	});
});

describe("POST /api/upload", () => {
	test("rejects request without file", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		expect(res.status).toBe(400);
	});

	test("rejects empty file", async () => {
		const formData = new FormData();
		formData.append("file", new File([], "empty.txt", { type: "text/plain" }));
		const res = await app.request("/api/upload", {
			method: "POST",
			body: formData,
		});
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("empty");
	});
});

describe("Download limits", () => {
	test("respects max downloads", async () => {
		// Create a drop with max 1 download
		queries.insertDrop.run({
			$id: "limited",
			$rootHash: "0xlimited",
			$fileName: "limited.txt",
			$fileSize: 10,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 1,
			$expiresAt: null,
			$ipAddress: null,
		});

		// Simulate 1 download
		queries.incrementDownloads.run("limited");

		// Now info should say limit reached
		const res = await app.request("/api/limited/info");
		expect(res.status).toBe(410);
	});
});

describe("Error response format", () => {
	test("404 has error field", async () => {
		const res = await app.request("/api/nonexistent/info");
		const json = await res.json();
		expect(json).toHaveProperty("error");
		expect(typeof json.error).toBe("string");
		expect(json.error.length).toBeGreaterThan(0);
	});

	test("401 has error field", async () => {
		const res = await app.request("/api/pw-test/download");
		const json = await res.json();
		expect(json).toHaveProperty("error");
		expect(typeof json.error).toBe("string");
	});

	test("400 has error field", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		const json = await res.json();
		expect(json).toHaveProperty("error");
	});

	test("410 has error field", async () => {
		queries.insertDrop.run({
			$id: "err-410",
			$rootHash: "0xerr410",
			$fileName: "expired.txt",
			$fileSize: 10,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: Math.floor(Date.now() / 1000) - 1,
			$ipAddress: null,
		});
		const res = await app.request("/api/err-410/info");
		const json = await res.json();
		expect(json).toHaveProperty("error");
	});
});
