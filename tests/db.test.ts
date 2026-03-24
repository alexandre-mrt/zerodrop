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
});
