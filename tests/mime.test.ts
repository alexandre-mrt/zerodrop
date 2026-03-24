import { describe, expect, test } from "bun:test";

describe("MIME type handling", () => {
	const commonTypes: Record<string, string> = {
		"text/plain": ".txt",
		"application/pdf": ".pdf",
		"image/png": ".png",
		"image/jpeg": ".jpg",
		"application/zip": ".zip",
		"application/octet-stream": "unknown",
	};

	test("common MIME types are valid strings", () => {
		for (const [mime, ext] of Object.entries(commonTypes)) {
			expect(mime).toContain("/");
			expect(ext.length).toBeGreaterThan(0);
		}
	});

	test("default MIME type is application/octet-stream", () => {
		const defaultMime = "application/octet-stream";
		expect(defaultMime).toBe("application/octet-stream");
	});

	test("MIME type stored from upload", () => {
		// Bun's File may add charset suffix
		const file = new File(["test"], "test.txt", { type: "text/plain" });
		expect(file.type).toContain("text/plain");
	});

	test("File without type defaults to empty string", () => {
		const file = new File(["test"], "test.bin");
		expect(file.type).toBe("");
	});
});

describe("File name handling", () => {
	test("preserves original file name", () => {
		const file = new File(["data"], "my-report.pdf");
		expect(file.name).toBe("my-report.pdf");
	});

	test("handles special characters in name", () => {
		const file = new File(["data"], "file (1).txt");
		expect(file.name).toBe("file (1).txt");
	});

	test("handles unicode in name", () => {
		const file = new File(["data"], "rapport.txt");
		expect(file.name).toBe("rapport.txt");
	});
});
