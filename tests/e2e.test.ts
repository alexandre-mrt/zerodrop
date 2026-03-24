import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";

const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");

const app = new Hono();
app.route("/api", dropRouter);

describe("End-to-end: create drop -> get info -> verify state", () => {
	test("seeded drop is retrievable and has correct state", async () => {
		queries.insertDrop.run({
			$id: "e2e-drop",
			$rootHash: "0xe2e",
			$fileName: "e2e-file.txt",
			$fileSize: 2048,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 5,
			$expiresAt: Math.floor(Date.now() / 1000) + 86400,
			$ipAddress: "10.0.0.1",
		});

		// Get info
		const res = await app.request("/api/e2e-drop/info");
		expect(res.status).toBe(200);
		const info = await res.json();
		expect(info.fileName).toBe("e2e-file.txt");
		expect(info.fileSize).toBe(2048);
		expect(info.downloads).toBe(0);
		expect(info.maxDownloads).toBe(5);
		expect(info.hasPassword).toBe(false);

		// Increment downloads
		queries.incrementDownloads.run("e2e-drop");
		queries.incrementDownloads.run("e2e-drop");

		// Verify updated
		const res2 = await app.request("/api/e2e-drop/info");
		const info2 = await res2.json();
		expect(info2.downloads).toBe(2);
	});
});
