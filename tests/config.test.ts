import { describe, expect, test } from "bun:test";

describe("App configuration", () => {
	test("default port is 3000", () => {
		const port = Number(process.env.PORT || 3000);
		expect(port).toBe(3000);
	});

	test("default base URL uses port", () => {
		const baseUrl = process.env.BASE_URL || "http://localhost:3000";
		expect(baseUrl).toContain("3000");
	});

	test("0G testnet RPC default", () => {
		const rpc = process.env.ZG_EVM_RPC || "https://evmrpc-testnet.0g.ai";
		expect(rpc).toContain("0g.ai");
	});
});
