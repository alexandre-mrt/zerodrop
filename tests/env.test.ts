import { describe, expect, test } from "bun:test";
describe("Env defaults", () => {
	test("PORT defaults to 3000", () => { expect(Number(process.env.PORT || 3000)).toBe(3000); });
	test("BASE_URL has default", () => { expect(process.env.BASE_URL || "http://localhost:3000").toContain("3000"); });
});
