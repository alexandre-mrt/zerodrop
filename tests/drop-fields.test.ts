import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { queries } = await import("../src/services/db");

describe("Drop field defaults", () => {
	test("downloads default to 0", () => {
		queries.insertDrop.run({
			$id: "def-test", $rootHash: "0xd", $fileName: "d.txt",
			$fileSize: 10, $mimeType: "text/plain", $passwordHash: null,
			$maxDownloads: null, $expiresAt: null, $ipAddress: null,
		});
		const d = queries.getDrop.get("def-test");
		expect(d!.downloads).toBe(0);
	});

	test("created_at is set automatically", () => {
		const d = queries.getDrop.get("def-test");
		expect(d!.created_at).toBeGreaterThan(0);
	});
});
