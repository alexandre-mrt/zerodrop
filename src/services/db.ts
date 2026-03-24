import { Database } from "bun:sqlite";

const DB_PATH = process.env.DATABASE_URL || "./data/zerodrop.db";

export const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode = WAL");

function createTables() {
	db.exec(`
    CREATE TABLE IF NOT EXISTS drops (
      id TEXT PRIMARY KEY,
      root_hash TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      password_hash TEXT,
      downloads INTEGER NOT NULL DEFAULT 0,
      max_downloads INTEGER,
      expires_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      ip_address TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_drops_id ON drops(id);
    CREATE INDEX IF NOT EXISTS idx_drops_expires ON drops(expires_at);
  `);
}

// Auto-init tables before prepared statements
createTables();

export function initializeDatabase() {
	createTables();
}

export interface DropRow {
	id: string;
	root_hash: string;
	file_name: string;
	file_size: number;
	mime_type: string;
	password_hash: string | null;
	downloads: number;
	max_downloads: number | null;
	expires_at: number | null;
	created_at: number;
	ip_address: string | null;
}

export const queries = {
	insertDrop: db.prepare(
		`INSERT INTO drops (id, root_hash, file_name, file_size, mime_type, password_hash, max_downloads, expires_at, ip_address)
     VALUES ($id, $rootHash, $fileName, $fileSize, $mimeType, $passwordHash, $maxDownloads, $expiresAt, $ipAddress)`,
	),

	getDrop: db.prepare<DropRow, [string]>(
		"SELECT * FROM drops WHERE id = ?",
	),

	incrementDownloads: db.prepare(
		"UPDATE drops SET downloads = downloads + 1 WHERE id = ?",
	),

	deleteDrop: db.prepare(
		"DELETE FROM drops WHERE id = ?",
	),

	cleanExpired: db.prepare(
		"DELETE FROM drops WHERE expires_at IS NOT NULL AND expires_at < unixepoch()",
	),

	recentDrops: db.prepare<DropRow, [string]>(
		"SELECT * FROM drops WHERE ip_address = ? ORDER BY created_at DESC LIMIT 10",
	),

	stats: db.prepare<{ total_drops: number; total_size: number; total_downloads: number }, []>(
		"SELECT COUNT(*) as total_drops, COALESCE(SUM(file_size), 0) as total_size, COALESCE(SUM(downloads), 0) as total_downloads FROM drops",
	),
};
