# ZeroDrop

## Overview
Decentralized file sharing web app powered by 0G Storage. Like WeTransfer but on-chain.
Users upload files, get shareable links, recipients download. Server-rendered HTML UI.

## Structure
```
src/
  index.ts          - Hono server, routes, frontend serving
  ui.ts             - Server-rendered HTML templates
  routes/drop.ts    - Upload/download/info API routes
  services/db.ts    - Bun SQLite database
  services/storage.ts - 0G Storage SDK wrapper
```

## Stack
- Runtime: Bun
- Framework: Hono
- DB: Bun SQLite (built-in)
- Storage: 0G via @0gfoundation/0g-ts-sdk + ethers v6
- Frontend: Server-rendered HTML + vanilla JS (no build step)

## Commands
- `bun install` - Install dependencies
- `bun run dev` - Start dev server (port 3000)
- `bun run build` - Build for production

## Key Routes
- `GET /` - Home page (upload UI)
- `POST /api/upload` - Upload file to 0G Storage
- `GET /d/:id` - Download page
- `GET /api/:id/download` - Download file
- `GET /api/:id/info` - Get drop metadata
