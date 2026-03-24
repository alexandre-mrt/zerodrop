import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dropRouter } from "./routes/drop";
import { initializeDatabase, queries } from "./services/db";
import { html } from "./ui";

initializeDatabase();

// Clean expired drops every hour
setInterval(() => {
	queries.cleanExpired.run();
}, 60 * 60 * 1000);

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.onError((err, c) => {
	console.error(`Unhandled error: ${err.message}`);
	return c.json({ error: "Internal server error" }, 500);
});

// API routes
app.route("/api", dropRouter);

// Frontend - home page
app.get("/", (c) => {
	return c.html(html.homePage());
});

// Frontend - download page
app.get("/d/:id", async (c) => {
	const dropId = c.req.param("id");
	const drop = queries.getDrop.get(dropId);

	if (!drop) {
		return c.html(html.errorPage("Drop not found", "This file may have been deleted or never existed."));
	}

	const now = Math.floor(Date.now() / 1000);
	if (drop.expires_at && drop.expires_at < now) {
		queries.deleteDrop.run(dropId);
		return c.html(html.errorPage("Drop expired", "This file has expired and is no longer available."));
	}

	if (drop.max_downloads && drop.downloads >= drop.max_downloads) {
		return c.html(html.errorPage("Download limit reached", "This file has reached its maximum number of downloads."));
	}

	return c.html(html.downloadPage({
		id: drop.id,
		fileName: drop.file_name,
		fileSize: drop.file_size,
		hasPassword: !!drop.password_hash,
		downloads: drop.downloads,
		maxDownloads: drop.max_downloads,
		expiresAt: drop.expires_at,
	}));
});

// Health
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

const PORT = Number(process.env.PORT || 3000);
console.log(`ZeroDrop running on http://localhost:${PORT}`);

export default {
	port: PORT,
	fetch: app.fetch,
};
