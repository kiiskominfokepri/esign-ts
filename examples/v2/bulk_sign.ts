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
const nik = requireEnv('ESIGN_NIK');
const email = requireEnv('ESIGN_EMAIL');
const passphrase = requireEnv('ESIGN_PASSPHRASE');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

const fileMap: Record<string, string> = {
  [resolve(__dirname, '../../storage/TEST-TTE-ESIGN.pdf')]: resolve(__dirname, '../../storage/signed/v2-bulk-1.pdf'),
  [resolve(__dirname, '../../storage/v2-unsigned.pdf')]: resolve(__dirname, '../../storage/signed/v2-bulk-2.pdf'),
};

console.log('Bulk signing documents (V2)...');

const response = await esign.signInvisibleMultiple(passphrase, fileMap);

if (response.ok) {
  const saved = response.saveAll();
  console.log(`Bulk signed: ${saved.join(', ')}`);
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}