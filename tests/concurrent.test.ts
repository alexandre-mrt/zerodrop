import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { queries } = await import("../src/services/db");

describe("Concurrent operations", () => {
	test("multiple inserts don't conflict with unique IDs", () => {
		const ids = Array.from({ length: 20 }, (_, i) => `concurrent-${Date.now()}-${i}`);

		for (const id of ids) {
			queries.insertDrop.run({
				$id: id,
				$rootHash: `0x${id}`,
				$fileName: `${id}.txt`,
				$fileSize: 100,
				$mimeType: "text/plain",
				$passwordHash: null,
				$maxDownloads: null,
				$expiresAt: null,
				$ipAddress: null,
			});
		}

		// All should be retrievable
		for (const id of ids) {
			const drop = queries.getDrop.get(id);
			expect(drop).toBeTruthy();
		}
	});

	test("increment is atomic", () => {
		queries.insertDrop.run({
			$id: "atomic-test",
			$rootHash: "0xatomic",
			$fileName: "atomic.txt",
			$fileSize: 10,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 100,
			$expiresAt: null,
			$ipAddress: null,
		});

		for (let i = 0; i < 50; i++) {
			queries.incrementDownloads.run("atomic-test");
		}

		const drop = queries.getDrop.get("atomic-test");
		expect(drop!.downloads).toBe(50);
	});
});
