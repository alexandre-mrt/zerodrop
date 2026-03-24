import { describe, expect, test } from "bun:test";
import { html } from "../src/ui";

describe("UI templates", () => {
	test("homePage returns valid HTML", () => {
		const page = html.homePage();
		expect(page).toContain("<!DOCTYPE html>");
		expect(page).toContain("ZeroDrop");
		expect(page).toContain("Upload");
		expect(page).toContain("0G");
	});

	test("downloadPage returns valid HTML with file info", () => {
		const page = html.downloadPage({
			id: "abc123",
			fileName: "test.pdf",
			fileSize: 1024000,
			hasPassword: false,
			downloads: 5,
			maxDownloads: 10,
			expiresAt: Math.floor(Date.now() / 1000) + 86400,
		});
		expect(page).toContain("test.pdf");
		expect(page).toContain("Download");
		expect(page).toContain("5/10 downloads");
	});

	test("downloadPage shows password field when protected", () => {
		const page = html.downloadPage({
			id: "abc",
			fileName: "secret.zip",
			fileSize: 500,
			hasPassword: true,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("password");
		expect(page).toContain("protected");
	});

	test("errorPage shows error message", () => {
		const page = html.errorPage("Not found", "File was deleted");
		expect(page).toContain("Not found");
		expect(page).toContain("File was deleted");
	});

	test("HTML escapes special characters in file name", () => {
		const page = html.downloadPage({
			id: "x",
			fileName: '<script>alert("xss")</script>',
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		// The filename in the .name div and title should be escaped
		expect(page).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
		// Should not contain the raw filename as an unescaped HTML tag
		expect(page).not.toContain('<div class="name"><script>');
	});
});
