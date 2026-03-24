import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { queries } = await import("../src/services/db");

describe("MIME type defaults", () => {
	test("stored mime type matches insert", () => {
		queries.insertDrop.run({
			$id: "mime-test", $rootHash: "0xm", $fileName: "m.pdf",
			$fileSize: 100, $mimeType: "application/pdf", $passwordHash: null,
			$maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		const d = queries.getDrop.get("mime-test");
		expect(d!.mime_type).toBe("application/pdf");
	});

	test("text/plain is preserved", () => {
		queries.insertDrop.run({
			$id: "mime-txt", $rootHash: "0xmt", $fileName: "t.txt",
			$fileSize: 10, $mimeType: "text/plain", $passwordHash: null,
			$maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		expect(queries.getDrop.get("mime-txt")!.mime_type).toBe("text/plain");
	});

	test("octet-stream for unknown types", () => {
		queries.insertDrop.run({
			$id: "mime-bin", $rootHash: "0xmb", $fileName: "b.bin",
			$fileSize: 10, $mimeType: "application/octet-stream", $passwordHash: null,
			$maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		expect(queries.getDrop.get("mime-bin")!.mime_type).toBe("application/octet-stream");
	});
});
