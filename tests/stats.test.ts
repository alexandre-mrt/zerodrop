import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");

const app = new Hono();
app.route("/api", dropRouter);

// Seed data
queries.insertDrop.run({
	$id: "stats-1", $rootHash: "0xs1", $fileName: "a.txt",
	$fileSize: 1000, $mimeType: "text/plain", $passwordHash: null,
	$maxDownloads: null, $expiresAt: null, $ipAddress: null,
});
queries.insertDrop.run({
	$id: "stats-2", $rootHash: "0xs2", $fileName: "b.txt",
	$fileSize: 2000, $mimeType: "text/plain", $passwordHash: null,
	$maxDownloads: null, $expiresAt: null, $ipAddress: null,
});
queries.incrementDownloads.run("stats-1");
queries.incrementDownloads.run("stats-1");
queries.incrementDownloads.run("stats-2");

describe("GET /api/stats", () => {
	test("returns aggregate statistics", async () => {
		const res = await app.request("/api/stats");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.totalDrops).toBeGreaterThanOrEqual(2);
		expect(json.totalSize).toBeGreaterThanOrEqual(3000);
		expect(json.totalDownloads).toBeGreaterThanOrEqual(3);
	});

	test("returns numeric values", async () => {
		const json = await (await app.request("/api/stats")).json();
		expect(typeof json.totalDrops).toBe("number");
		expect(typeof json.totalSize).toBe("number");
		expect(typeof json.totalDownloads).toBe("number");
	});
});
