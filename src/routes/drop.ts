import { Hono } from "hono";
import { nanoid } from "nanoid";
import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { queries } from "../services/db";
import { downloadFromZeroG, uploadToZeroG } from "../services/storage";

export const dropRouter = new Hono();

const MAX_FREE_SIZE = 100 * 1024 * 1024; // 100 MB
const DEFAULT_EXPIRY_HOURS = 24 * 7; // 7 days

function hashPassword(password: string): string {
	return createHash("sha256").update(password).digest("hex");
}

// Upload a file and create a drop
dropRouter.post("/upload", async (c) => {
	const body = await c.req.parseBody();
	const file = body.file;

	if (!file || !(file instanceof File)) {
		return c.json({ error: "No file provided" }, 400);
	}

	if (file.size === 0) {
		return c.json({ error: "Cannot upload an empty file" }, 400);
	}

	if (file.size > MAX_FREE_SIZE) {
		return c.json({ error: "File too large. Maximum 100 MB for free tier." }, 413);
	}

	const password = typeof body.password === "string" && body.password.length > 0 ? body.password : null;
	const rawMaxDownloads = typeof body.maxDownloads === "string" ? Number(body.maxDownloads) : null;
	const maxDownloads = rawMaxDownloads !== null && rawMaxDownloads > 0 ? rawMaxDownloads : null;
	const rawExpiry = typeof body.expiryHours === "string" ? Number(body.expiryHours) : DEFAULT_EXPIRY_HOURS;
	const expiryHours = rawExpiry > 0 && rawExpiry <= 8760 ? rawExpiry : DEFAULT_EXPIRY_HOURS; // max 1 year

	const buffer = Buffer.from(await file.arrayBuffer());

	try {
		const { rootHash } = await uploadToZeroG(buffer, file.name);

		const dropId = nanoid(10); // Short URL-friendly ID
		const expiresAt = Math.floor(Date.now() / 1000) + expiryHours * 3600;
		const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

		queries.insertDrop.run({
			$id: dropId,
			$rootHash: rootHash,
			$fileName: file.name,
			$fileSize: file.size,
			$mimeType: file.type || "application/octet-stream",
			$passwordHash: password ? hashPassword(password) : null,
			$maxDownloads: maxDownloads,
			$expiresAt: expiresAt,
			$ipAddress: ip,
		});

		const baseUrl = process.env.BASE_URL || "http://localhost:3000";

		return c.json({
			success: true,
			drop: {
				id: dropId,
				url: `${baseUrl}/d/${dropId}`,
				fileName: file.name,
				fileSize: file.size,
				expiresAt: new Date(expiresAt * 1000).toISOString(),
				hasPassword: !!password,
				maxDownloads,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Upload failed";
		return c.json({ error: message }, 500);
	}
});

// Get drop info (without downloading)
dropRouter.get("/:id/info", async (c) => {
	const dropId = c.req.param("id");
	const drop = queries.getDrop.get(dropId);

	if (!drop) {
		return c.json({ error: "Drop not found" }, 404);
	}

	const now = Math.floor(Date.now() / 1000);
	if (drop.expires_at && drop.expires_at < now) {
		queries.deleteDrop.run(dropId);
		return c.json({ error: "Drop has expired" }, 410);
	}

	if (drop.max_downloads && drop.downloads >= drop.max_downloads) {
		return c.json({ error: "Download limit reached" }, 410);
	}

	return c.json({
		id: drop.id,
		fileName: drop.file_name,
		fileSize: drop.file_size,
		mimeType: drop.mime_type,
		hasPassword: !!drop.password_hash,
		downloads: drop.downloads,
		maxDownloads: drop.max_downloads,
		expiresAt: drop.expires_at ? new Date(drop.expires_at * 1000).toISOString() : null,
		createdAt: new Date(drop.created_at * 1000).toISOString(),
	});
});

// Download a file
dropRouter.get("/:id/download", async (c) => {
	const dropId = c.req.param("id");
	const drop = queries.getDrop.get(dropId);

	if (!drop) {
		return c.json({ error: "Drop not found" }, 404);
	}

	const now = Math.floor(Date.now() / 1000);
	if (drop.expires_at && drop.expires_at < now) {
		queries.deleteDrop.run(dropId);
		return c.json({ error: "Drop has expired" }, 410);
	}

	if (drop.max_downloads && drop.downloads >= drop.max_downloads) {
		return c.json({ error: "Download limit reached" }, 410);
	}

	// Password check
	if (drop.password_hash) {
		const password = c.req.query("password") || c.req.header("X-Drop-Password");
		if (!password || hashPassword(password) !== drop.password_hash) {
			return c.json({ error: "Invalid password" }, 401);
		}
	}

	try {
		const outputPath = await downloadFromZeroG(drop.root_hash, drop.file_name);
		const fileBuffer = await readFile(outputPath);
		await rm(outputPath, { force: true }).catch(() => {});

		queries.incrementDownloads.run(dropId);

		c.header("Content-Type", drop.mime_type);
		c.header("Content-Disposition", `attachment; filename="${drop.file_name}"`);
		c.header("Content-Length", String(fileBuffer.length));

		return c.body(fileBuffer);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Download failed";
		return c.json({ error: message }, 500);
	}
});
