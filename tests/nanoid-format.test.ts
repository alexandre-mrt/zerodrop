import { describe, expect, test } from "bun:test";
import { nanoid } from "nanoid";

describe("nanoid format for drop IDs", () => {
	test("custom length produces exact size", () => {
		expect(nanoid(10).length).toBe(10);
		expect(nanoid(21).length).toBe(21);
	});

	test("only contains URL-safe chars", () => {
		for (let i = 0; i < 50; i++) {
			const id = nanoid(10);
			expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
		}
	});
});
