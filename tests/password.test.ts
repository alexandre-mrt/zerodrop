import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";

function hashPassword(pw: string): string {
	return createHash("sha256").update(pw).digest("hex");
}

describe("Password hash properties", () => {
	test("hash length is always 64", () => {
		for (const pw of ["a", "password", "x".repeat(1000)]) {
			expect(hashPassword(pw).length).toBe(64);
		}
	});

	test("empty vs non-empty produce different hashes", () => {
		expect(hashPassword("")).not.toBe(hashPassword("a"));
	});
});
