import { describe, expect, test } from "bun:test";
import { html } from "../src/ui";

describe("Home page structure", () => {
	const page = html.homePage();

	test("has file input hidden by default", () => {
		expect(page).toContain('style="display:none"');
		expect(page).toContain('id="file-input"');
	});

	test("has upload form with POST", () => {
		expect(page).toContain("POST");
		expect(page).toContain("/api/upload");
	});

	test("has progress bar hidden by default", () => {
		expect(page).toContain('id="progress"');
		expect(page).toContain("width: 0%");
	});

	test("has result area hidden by default", () => {
		expect(page).toContain('id="result"');
		expect(page).toContain("display: none");
	});

	test("has powered by 0G footer", () => {
		expect(page).toContain("0g.ai");
		expect(page).toContain("Powered by");
	});
});

describe("Download page variants", () => {
	test("no-password drop shows download button directly", () => {
		const page = html.downloadPage({
			id: "direct",
			fileName: "file.zip",
			fileSize: 5000000,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("Download File");
		expect(page).not.toContain("password");
	});

	test("password drop shows password input", () => {
		const page = html.downloadPage({
			id: "pw",
			fileName: "secret.zip",
			fileSize: 1000,
			hasPassword: true,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain('type="password"');
		expect(page).toContain("protected");
	});

	test("shows download count badge", () => {
		const page = html.downloadPage({
			id: "counted",
			fileName: "file.txt",
			fileSize: 100,
			hasPassword: false,
			downloads: 42,
			maxDownloads: 100,
			expiresAt: null,
		});
		expect(page).toContain("42/100");
	});

	test("shows expiry date when set", () => {
		const futureTs = Math.floor(Date.now() / 1000) + 86400;
		const page = html.downloadPage({
			id: "expiring",
			fileName: "temp.txt",
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: futureTs,
		});
		expect(page).toContain("Expires");
	});

	test("shows No expiry when null", () => {
		const page = html.downloadPage({
			id: "perm",
			fileName: "perm.txt",
			fileSize: 100,
			hasPassword: false,
			downloads: 0,
			maxDownloads: null,
			expiresAt: null,
		});
		expect(page).toContain("No expiry");
	});
});
