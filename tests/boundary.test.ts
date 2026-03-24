import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");
const app = new Hono();
app.route("/api", dropRouter);

describe("Download limit boundary", () => {
	test("exactly at max downloads returns 410 on info", () => {
		queries.insertDrop.run({
			$id: "boundary-dl",
			$rootHash: "0xbdl",
			$fileName: "b.txt",
			$fileSize: 10,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 3,
			$expiresAt: null,
			$ipAddress: null,
		});
		queries.incrementDownloads.run("boundary-dl");
		queries.incrementDownloads.run("boundary-dl");
		queries.incrementDownloads.run("boundary-dl"); // exactly at limit
	});

	test("one below max is still accessible", async () => {
		queries.insertDrop.run({
			$id: "below-max",
			$rootHash: "0xbelowmax",
			$fileName: "below.txt",
			$fileSize: 10,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 5,
			$expiresAt: null,
			$ipAddress: null,
		});
		queries.incrementDownloads.run("below-max");
		queries.incrementDownloads.run("below-max");
		queries.incrementDownloads.run("below-max");
		queries.incrementDownloads.run("below-max"); // 4 of 5

		const res = await app.request("/api/below-max/info");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.downloads).toBe(4);
	});
});
