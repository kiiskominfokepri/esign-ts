import { createEsignClient } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');
const idDokumen = process.argv[2] ?? getEnv('ESIGN_ID_DOKUMEN');

if (!idDokumen) {
  console.error('Usage: npx tsx examples/v1/download.ts <id_dokumen>');
  console.error('Or set ESIGN_ID_DOKUMEN in .env');
  process.exit(1);
}

const savePath = resolve(__dirname, '../../storage/signed/v1-downloaded.pdf');

const esign = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
});

console.log(`Downloading document: ${idDokumen}`);

const success = await esign.downloadDocument(idDokumen, savePath);

if (success) {
  console.log(`Downloaded: ${savePath}`);
  process.exit(0);
} else {
  console.error(`Download failed for id_dokumen=${idDokumen}`);
  process.exit(1);
}