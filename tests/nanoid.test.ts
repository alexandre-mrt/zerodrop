import { describe, expect, test } from "bun:test";
import { nanoid } from "nanoid";

describe("Drop ID generation", () => {
	test("nanoid(10) produces 10-char IDs", () => {
		const id = nanoid(10);
		expect(id.length).toBe(10);
	});

	test("IDs are unique", () => {
		const ids = new Set(Array.from({ length: 100 }, () => nanoid(10)));
		expect(ids.size).toBe(100);
	});

	test("IDs are URL-safe", () => {
		const id = nanoid(10);
		expect(encodeURIComponent(id)).toBe(id);
	});
});
