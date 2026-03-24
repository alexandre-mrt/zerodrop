import { describe, expect, test } from "bun:test";

describe("Expiry calculation", () => {
	test("24 hours in seconds", () => {
		expect(24 * 3600).toBe(86400);
	});

	test("7 days in seconds", () => {
		expect(7 * 24 * 3600).toBe(604800);
	});

	test("expiry timestamp is in the future", () => {
		const now = Math.floor(Date.now() / 1000);
		const expiry = now + 24 * 3600;
		expect(expiry).toBeGreaterThan(now);
	});
});
