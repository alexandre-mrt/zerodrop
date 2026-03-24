import { describe, expect, test } from "bun:test";

describe("File size constants", () => {
	test("1 KB = 1024 bytes", () => expect(1024).toBe(1024));
	test("1 MB = 1048576 bytes", () => expect(1024 * 1024).toBe(1048576));
	test("100 MB limit in bytes", () => expect(100 * 1024 * 1024).toBe(104857600));
});
