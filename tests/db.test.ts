import { describe, expect, test, beforeAll } from "bun:test";

// Force in-memory DB before importing
process.env.DATABASE_URL = ":memory:";

// Dynamic import to pick up env var
const { initializeDatabase, queries } = await import("../src/services/db");

beforeAll(() => {
	initializeDatabase();
});

describe("Database - drops", () => {
	test("insert and get a drop", () => {
		queries.insertDrop.run({
			$id: "test-drop-1",
			$rootHash: "0xhash123",
			$fileName: "test.txt",
			$fileSize: 1024,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 10,
			$expiresAt: Math.floor(Date.now() / 1000) + 86400,
			$ipAddress: "127.0.0.1",
		});

		const drop = queries.getDrop.get("test-drop-1");
		expect(drop).toBeTruthy();
		expect(drop!.file_name).toBe("test.txt");
		expect(drop!.file_size).toBe(1024);
		expect(drop!.downloads).toBe(0);
		expect(drop!.max_downloads).toBe(10);
	});

	test("get returns null for nonexistent drop", () => {
		const drop = queries.getDrop.get("nonexistent");
		expect(drop).toBeNull();
	});

	test("increment downloads", () => {
		queries.incrementDownloads.run("test-drop-1");
		const drop = queries.getDrop.get("test-drop-1");
		expect(drop!.downloads).toBe(1);

		queries.incrementDownloads.run("test-drop-1");
		const drop2 = queries.getDrop.get("test-drop-1");
		expect(drop2!.downloads).toBe(2);
	});

	test("delete drop", () => {
		queries.insertDrop.run({
			$id: "to-delete",
			$rootHash: "0xhash456",
			$fileName: "delete-me.txt",
			$fileSize: 100,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: null,
			$ipAddress: null,
		});

		queries.deleteDrop.run("to-delete");
		const drop = queries.getDrop.get("to-delete");
		expect(drop).toBeNull();
	});

	test("insert drop with password", () => {
		queries.insertDrop.run({
			$id: "pw-drop",
			$rootHash: "0xhash789",
			$fileName: "secret.pdf",
			$fileSize: 5000,
			$mimeType: "application/pdf",
			$passwordHash: "hashed_password_here",
			$maxDownloads: 1,
			$expiresAt: Math.floor(Date.now() / 1000) + 3600,
			$ipAddress: "192.168.1.1",
		});

		const drop = queries.getDrop.get("pw-drop");
		expect(drop!.password_hash).toBe("hashed_password_here");
	});

	test("clean expired drops", () => {
		// Insert an already-expired drop
		queries.insertDrop.run({
			$id: "expired-drop",
			$rootHash: "0xexpired",
			$fileName: "old.txt",
			$fileSize: 100,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
			$ipAddress: null,
		});

		queries.cleanExpired.run();
		const drop = queries.getDrop.get("expired-drop");
		expect(drop).toBeNull();
	});

	test("recent drops by IP", () => {
		const drops = queries.recentDrops.all("127.0.0.1");
		expect(drops.length).toBeGreaterThanOrEqual(1);
		expect(drops[0].ip_address).toBe("127.0.0.1");
	});

	test("download counter increments correctly under load", () => {
		queries.insertDrop.run({
			$id: "counter-test",
			$rootHash: "0xcounter",
			$fileName: "count.txt",
			$fileSize: 100,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: 100,
			$expiresAt: null,
			$ipAddress: null,
		});

		for (let i = 0; i < 10; i++) {
			queries.incrementDownloads.run("counter-test");
		}

		const drop = queries.getDrop.get("counter-test");
		expect(drop!.downloads).toBe(10);
	});

	test("recent drops are ordered by creation time", () => {
		// Insert drops with unique IP to avoid cross-test pollution
		const ip = `10.0.0.${Date.now() % 256}`;
		for (let i = 0; i < 3; i++) {
			queries.insertDrop.run({
				$id: `order-${Date.now()}-${i}`,
				$rootHash: `0xorder${Date.now()}${i}`,
				$fileName: `order-${i}.txt`,
				$fileSize: i * 100,
				$mimeType: "text/plain",
				$passwordHash: null,
				$maxDownloads: null,
				$expiresAt: null,
				$ipAddress: ip,
			});
		}

		const drops = queries.recentDrops.all(ip);
		expect(drops.length).toBe(3);
		// Most recent first (DESC order)
		for (let i = 0; i < drops.length - 1; i++) {
			expect(drops[i].created_at).toBeGreaterThanOrEqual(drops[i + 1].created_at);
		}
	});

	test("duplicate ID insertion fails", () => {
		queries.insertDrop.run({
			$id: "dup-id",
			$rootHash: "0xdup1",
			$fileName: "first.txt",
			$fileSize: 100,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: null,
			$ipAddress: null,
		});

		expect(() => {
			queries.insertDrop.run({
				$id: "dup-id",
				$rootHash: "0xdup2",
				$fileName: "second.txt",
				$fileSize: 200,
				$mimeType: "text/plain",
				$passwordHash: null,
				$maxDownloads: null,
				$expiresAt: null,
				$ipAddress: null,
			});
		}).toThrow();
	});

	test("null expiry means no expiration", () => {
		queries.insertDrop.run({
			$id: "no-expiry",
			$rootHash: "0xnoexpiry",
			$fileName: "forever.txt",
			$fileSize: 100,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: null,
			$ipAddress: null,
		});

		const drop = queries.getDrop.get("no-expiry");
		expect(drop).toBeTruthy();
		expect(drop!.expires_at).toBeNull();
	});

	test("cleanExpired does not delete non-expired drops", () => {
		queries.insertDrop.run({
			$id: "still-valid",
			$rootHash: "0xvalid",
			$fileName: "valid.txt",
			$fileSize: 50,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: Math.floor(Date.now() / 1000) + 86400, // +24h
			$ipAddress: null,
		});

		queries.cleanExpired.run();
		const drop = queries.getDrop.get("still-valid");
		expect(drop).toBeTruthy();
	});

	test("cleanExpired does not delete null-expiry drops", () => {
		queries.insertDrop.run({
			$id: "null-clean",
			$rootHash: "0xnullclean",
			$fileName: "null.txt",
			$fileSize: 50,
			$mimeType: "text/plain",
			$passwordHash: null,
			$maxDownloads: null,
			$expiresAt: null,
			$ipAddress: null,
		});

		queries.cleanExpired.run();
		const drop = queries.getDrop.get("null-clean");
		expect(drop).toBeTruthy();
	});
});
