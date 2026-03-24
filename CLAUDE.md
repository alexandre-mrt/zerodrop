# ZeroDrop

## Overview
Decentralized file sharing web app powered by 0G Storage. Like WeTransfer but on-chain.
Users upload files, get shareable links, recipients download. Server-rendered HTML UI.

## Structure
```
src/
  index.ts          - Hono server + frontend routes + error handler
  ui.ts             - Server-rendered HTML templates (XSS-safe)
  routes/drop.ts    - Upload/download/info/stats API routes
  services/db.ts    - Bun SQLite (auto-init tables)
  services/storage.ts - 0G Storage SDK wrapper (lazy-init)
```

## Stack
- Runtime: Bun
- Framework: Hono
- DB: Bun SQLite (built-in)
- Storage: 0G via @0gfoundation/0g-ts-sdk + ethers v6
- Frontend: Server-rendered HTML + vanilla JS
- CI: GitHub Actions
- Tests: 116 tests via bun test

## Commands
- `bun install && mkdir -p data` - Setup
- `bun run dev` - Start dev server (port 3000)
- `bun test` - Run all 116 tests
- `bun run build` - Build for production

## Key Routes
- `GET /` - Home page (upload UI)
- `POST /api/upload` - Upload file (multipart, max 100MB)
- `GET /d/:id` - Download page (HTML)
- `GET /api/:id/info` - Drop metadata (JSON)
- `GET /api/:id/download` - Download file (with password support)
- `GET /api/stats` - Aggregate statistics
- `GET /health` - Health check
