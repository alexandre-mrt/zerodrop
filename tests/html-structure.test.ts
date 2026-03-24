import { describe, expect, test } from "bun:test";
import { html } from "../src/ui";

describe("HTML document structure", () => {
	test("all pages close html tag", () => {
		const pages = [
			html.homePage(),
			html.downloadPage({ id: "t", fileName: "t", fileSize: 1, hasPassword: false, downloads: 0, maxDownloads: null, expiresAt: null }),
			html.errorPage("err", "msg"),
		];
		for (const page of pages) {
			expect(page).toContain("</html>");
			expect(page).toContain("</body>");
			expect(page).toContain("</head>");
		}
	});

	test("all pages have viewport meta", () => {
		const page = html.homePage();
		expect(page).toContain("viewport");
		expect(page).toContain("width=device-width");
	});
});
