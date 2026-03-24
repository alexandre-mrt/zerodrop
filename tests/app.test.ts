import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";

const { queries } = await import("../src/services/db");
const { html } = await import("../src/ui");

// Build a mini app for testing frontend routes
const app = new Hono();

app.get("/", (c) => c.html(html.homePage()));

app.get("/d/:id", (c) => {
	const drop = queries.getDrop.get(c.req.param("id"));
	if (!drop) return c.html(html.errorPage("Not found", "Does not exist"));

	const now = Math.floor(Date.now() / 1000);
	if (drop.expires_at && drop.expires_at < now) {
		return c.html(html.errorPage("Expired", "Gone"));
	}

	return c.html(html.downloadPage({
		id: drop.id,
		fileName: drop.file_name,
		fileSize: drop.file_size,
		hasPassword: !!drop.password_hash,
		downloads: drop.downloads,
		maxDownloads: drop.max_downloads,
		expiresAt: drop.expires_at,
	}));
});

app.get("/health", (c) => c.json({ status: "ok" }));

// Seed test data
queries.insertDrop.run({
	$id: "front-test",
	$rootHash: "0xhash",
	$fileName: "report.pdf",
	$fileSize: 50000,
	$mimeType: "application/pdf",
	$passwordHash: null,
	$maxDownloads: null,
	$expiresAt: Math.floor(Date.now() / 1000) + 86400,
	$ipAddress: null,
});

describe("Frontend routes", () => {
	test("GET / returns home page HTML", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("ZeroDrop");
		expect(text).toContain("Upload");
		expect(text).toContain("<!DOCTYPE html>");
	});

	test("GET /d/:id returns download page for valid drop", async () => {
		const res = await app.request("/d/front-test");
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("report.pdf");
		expect(text).toContain("Download");
	});

	test("GET /d/:id returns error for invalid drop", async () => {
		const res = await app.request("/d/nonexistent");
		expect(res.status).toBe(200); // HTML error page, still 200
		const text = await res.text();
		expect(text).toContain("Not found");
	});

	test("GET /health returns JSON", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.status).toBe("ok");
	});
});
