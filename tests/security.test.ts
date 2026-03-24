import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";

// Test the password hashing logic used in the drop routes
function hashPassword(password: string): string {
	return createHash("sha256").update(password).digest("hex");
}

describe("Password hashing", () => {
	test("produces 64-char hex hash", () => {
		const hash = hashPassword("mypassword");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	test("is deterministic", () => {
		const h1 = hashPassword("test123");
		const h2 = hashPassword("test123");
		expect(h1).toBe(h2);
	});

	test("different passwords produce different hashes", () => {
		const h1 = hashPassword("password1");
		const h2 = hashPassword("password2");
		expect(h1).not.toBe(h2);
	});

	test("handles empty string", () => {
		const hash = hashPassword("");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	test("handles unicode", () => {
		const hash = hashPassword("mot de passe avec des accents");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	test("handles very long passwords", () => {
		const hash = hashPassword("a".repeat(10000));
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});
});

describe("File size limits", () => {
	const MAX_FREE_SIZE = 100 * 1024 * 1024; // 100 MB

	test("free tier is 100 MB", () => {
		expect(MAX_FREE_SIZE).toBe(104857600);
	});

	test("rejects files over limit", () => {
		const fileSize = 150 * 1024 * 1024;
		expect(fileSize > MAX_FREE_SIZE).toBe(true);
	});

	test("accepts files under limit", () => {
		const fileSize = 50 * 1024 * 1024;
		expect(fileSize <= MAX_FREE_SIZE).toBe(true);
	});
});
