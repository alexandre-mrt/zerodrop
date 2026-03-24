import { describe, expect, test } from "bun:test";
import { html } from "../src/ui";

describe("HTML escaping in templates", () => {
	test("escapes < and > in file name", () => {
		const page = html.downloadPage({
			id: "xss-test",
			fileName: "file<img>name",
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("&lt;img&gt;");
		expect(page).not.toContain("<img>");
	});

	test("escapes quotes in file name", () => {
		const page = html.downloadPage({
			id: "quote-test",
			fileName: 'file"with"quotes',
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("&quot;");
	});

	test("escapes ampersand", () => {
		const page = html.downloadPage({
			id: "amp-test",
			fileName: "file&name",
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("&amp;");
	});

	test("error page escapes both title and message", () => {
		const page = html.errorPage("<b>bold</b>", "<i>italic</i>");
		expect(page).not.toContain("<b>bold</b>");
		expect(page).not.toContain("<i>italic</i>");
		expect(page).toContain("&lt;b&gt;");
		expect(page).toContain("&lt;i&gt;");
	});

	test("normal text passes through unchanged", () => {
		const page = html.downloadPage({
			id: "normal",
			fileName: "normal-file.pdf",
			fileSize: 5000,
			hasPassword: false,
			downloads: 3,
			maxDownloads: 10,
			expiresAt: null,
		});
		expect(page).toContain("normal-file.pdf");
		expect(page).toContain("3/10 downloads");
	});
});
