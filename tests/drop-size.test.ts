import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { queries } = await import("../src/services/db");

describe("Drop size storage", () => {
	test("stores exact file size", () => {
		queries.insertDrop.run({
			$id: "sz-test", $rootHash: "0xsz", $fileName: "sz.bin",
			$fileSize: 12345678, $mimeType: "application/octet-stream",
			$passwordHash: null, $maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		expect(queries.getDrop.get("sz-test")!.file_size).toBe(12345678);
	});

	test("handles zero-byte files in DB", () => {
		queries.insertDrop.run({
			$id: "sz-zero", $rootHash: "0xsz0", $fileName: "z.txt",
			$fileSize: 0, $mimeType: "text/plain",
			$passwordHash: null, $maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		expect(queries.getDrop.get("sz-zero")!.file_size).toBe(0);
	});
});
