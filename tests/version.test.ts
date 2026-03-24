import { describe, expect, test } from "bun:test";

describe("App version", () => {
	test("version is semver", () => {
		const pkg = require("../package.json");
		expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
	});

	test("name is zerodrop", () => {
		const pkg = require("../package.json");
		expect(pkg.name).toBe("zerodrop");
	});
});
