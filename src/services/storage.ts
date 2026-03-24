import { Indexer, ZgFile } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EVM_RPC = process.env.ZG_EVM_RPC || "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC =
	process.env.ZG_INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai";

// Lazy-init to avoid crashing at import time in tests
let _signer: ethers.Wallet | null = null;

function getSigner(): ethers.Wallet {
	if (!_signer) {
		const privateKey = process.env.ZG_PRIVATE_KEY;
		if (!privateKey) {
			throw new Error("ZG_PRIVATE_KEY environment variable is required");
		}
		const provider = new ethers.JsonRpcProvider(EVM_RPC);
		_signer = new ethers.Wallet(privateKey, provider);
	}
	return _signer;
}

export async function uploadToZeroG(
	buffer: Buffer,
	fileName: string,
): Promise<{ rootHash: string }> {
	const tempDir = await mkdtemp(join(tmpdir(), "zd-"));
	const tempPath = join(tempDir, fileName);

	try {
		await writeFile(tempPath, buffer);

		const file = await ZgFile.fromFilePath(tempPath);
		const [tree, treeErr] = await file.merkleTree();

		if (treeErr || !tree) {
			throw new Error(`Failed to compute merkle tree: ${treeErr}`);
		}

		const rootHash = tree.rootHash() ?? "";
		const indexer = new Indexer(INDEXER_RPC);
		const [, uploadErr] = await indexer.upload(file, EVM_RPC, getSigner());

		if (uploadErr) {
			throw new Error(`Upload failed: ${uploadErr}`);
		}

		await file.close();
		return { rootHash };
	} finally {
		await rm(tempDir, { recursive: true, force: true }).catch(() => {});
	}
}

export async function downloadFromZeroG(
	rootHash: string,
	fileName: string,
): Promise<string> {
	const tempDir = await mkdtemp(join(tmpdir(), "zd-dl-"));
	const outputPath = join(tempDir, fileName);

	const indexer = new Indexer(INDEXER_RPC);
	const [, downloadErr] = await indexer.download(rootHash, outputPath, true);

	if (downloadErr) {
		await rm(tempDir, { recursive: true, force: true }).catch(() => {});
		throw new Error(`Download failed: ${downloadErr}`);
	}

	return outputPath;
}
