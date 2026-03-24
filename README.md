# ZeroDrop

[![CI](https://github.com/alexandre-mrt/zerodrop/actions/workflows/ci.yml/badge.svg)](https://github.com/alexandre-mrt/zerodrop/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Decentralized file sharing powered by 0G Storage.**

Share files with anyone using a simple link. Files are stored on [0G decentralized storage](https://0g.ai), ensuring permanence, censorship resistance, and data integrity.

Like WeTransfer, but on-chain.

## Features

- **Drag & drop upload** - Clean, modern UI for uploading files
- **Shareable links** - Short URLs for easy sharing
- **Password protection** - Optional password for private drops
- **Download limits** - Set maximum number of downloads
- **Auto-expiry** - Files expire after configurable time (24h, 7d, 30d)
- **Decentralized storage** - Files stored on 0G Storage network
- **No signup required** - Upload and share instantly

## Demo

Upload: `https://zerodrop.dev`
Download: `https://zerodrop.dev/d/abc123`

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- 0G wallet with testnet tokens

### Setup

```bash
git clone https://github.com/alexandre-mrt/zerodrop.git
cd zerodrop
cp .env.example .env
# Edit .env with your 0G private key
bun install
mkdir -p data
bun run dev
```

Open `http://localhost:3000` and start sharing files!

## API

### Upload

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@./document.pdf" \
  -F "password=secret123" \
  -F "expiryHours=168" \
  -F "maxDownloads=10"
```

Response:
```json
{
  "success": true,
  "drop": {
    "id": "abc123xyz",
    "url": "http://localhost:3000/d/abc123xyz",
    "fileName": "document.pdf",
    "fileSize": 1234567,
    "expiresAt": "2026-03-31T00:00:00.000Z",
    "hasPassword": true,
    "maxDownloads": 10
  }
}
```

### Download

```bash
# Without password
curl http://localhost:3000/api/abc123xyz/download -o file.pdf

# With password
curl "http://localhost:3000/api/abc123xyz/download?password=secret123" -o file.pdf
```

### Get Info

```bash
curl http://localhost:3000/api/abc123xyz/info
```

## Architecture

```
Client (browser)
  |
  v
Hono Server (Bun)
  |-- Upload --> 0G Storage (decentralized)
  |-- Metadata --> SQLite (local)
  |-- Download --> 0G Storage --> Client
```

**Why server-rendered HTML?** No build step, instant load times, SEO-friendly, works without JavaScript for basic functionality. The upload form uses vanilla JS for drag-and-drop and progress feedback.

## Revenue Model

- **Free tier:** 100 MB per file, 7-day expiry
- **Pro ($5/mo):** 1 GB per file, 30-day expiry, custom URLs
- **Business ($19/mo):** 5 GB per file, 90-day expiry, analytics, branding

## 0G Network

- **Testnet (Galileo):** `https://evmrpc-testnet.0g.ai` | Chain ID 16602
- **Mainnet (Aristotle):** `https://evmrpc.0g.ai` | Chain ID 16661

## License

MIT
