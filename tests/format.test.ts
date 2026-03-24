import { describe, expect, test } from "bun:test";

// Replicate the formatBytes function from ui.ts to test it
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

describe("formatBytes", () => {
	test("0 bytes", () => {
		expect(formatBytes(0)).toBe("0 B");
	});

	test("bytes range", () => {
		expect(formatBytes(1)).toBe("1 B");
		expect(formatBytes(500)).toBe("500 B");
		expect(formatBytes(1023)).toBe("1023 B");
	});

	test("kilobytes", () => {
		expect(formatBytes(1024)).toBe("1 KB");
		expect(formatBytes(1536)).toBe("1.5 KB");
		expect(formatBytes(10240)).toBe("10 KB");
	});

	test("megabytes", () => {
		expect(formatBytes(1048576)).toBe("1 MB");
		expect(formatBytes(5242880)).toBe("5 MB");
		expect(formatBytes(104857600)).toBe("100 MB");
	});

	test("gigabytes", () => {
		expect(formatBytes(1073741824)).toBe("1 GB");
		expect(formatBytes(10737418240)).toBe("10 GB");
	});

	test("decimal precision", () => {
		expect(formatBytes(1500)).toBe("1.5 KB");
		expect(formatBytes(2500000)).toBe("2.4 MB");
	});
});
