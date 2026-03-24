import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { dropRouter } = await import("../src/routes/drop");
const { queries } = await import("../src/services/db");

const app = new Hono();
app.route("/api", dropRouter);

queries.insertDrop.run({
	$id: "ct-test",
	$rootHash: "0xct",
	$fileName: "ct.txt",
	$fileSize: 100,
	$mimeType: "text/plain",
	$passwordHash: null,
	$maxDownloads: null,
	$expiresAt: null,
	$ipAddress: null,
});

describe("Content-Type headers", () => {
	test("info endpoint returns JSON", async () => {
		const res = await app.request("/api/ct-test/info");
		expect(res.headers.get("content-type")).toContain("json");
	});

	test("error responses are JSON", async () => {
		const res = await app.request("/api/missing/info");
		expect(res.headers.get("content-type")).toContain("json");
	});

	test("upload error is JSON", async () => {
		const res = await app.request("/api/upload", { method: "POST" });
		expect(res.headers.get("content-type")).toContain("json");
	});
});
