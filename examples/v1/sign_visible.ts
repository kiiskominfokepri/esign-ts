import { createEsignClient, VisibleSignOptions } from '@kiiskominfokepri/esign';
import { loadEnv, requireEnv, getEnv } from '../env.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { existsSync } from 'node:fs';

loadEnv();

const baseUrl = requireEnv('ESIGN_BASE_URL');
const username = requireEnv('ESIGN_USERNAME');
const password = requireEnv('ESIGN_PASSWORD');
const nik = requireEnv('ESIGN_NIK');
const passphrase = requireEnv('ESIGN_PASSPHRASE');

const imagePath = resolve(__dirname, getEnv('ESIGN_TTD_IMAGE', '../../storage/ttd.png'));

if (!existsSync(imagePath)) {
  console.error(`TTD image not found: ${imagePath}`);
  console.error('Set ESIGN_TTD_IMAGE in .env or place ttd.png under storage/.');
  process.exit(1);
}

const filePath = resolve(__dirname, '../../storage/TEST-TTE-ESIGN.pdf');
const savePath = resolve(__dirname, '../../storage/signed/v1-signed-visible.pdf');

const esign = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
  nik,
});

const options = VisibleSignOptions.withImage(imagePath, 1, 100, 100, 150, 50)
  .withReason('Persetujuan dokumen')
  .withLocation('Tanjungpinang');

console.log('Signing document visibly (V1)...');

const response = await esign.signVisible(passphrase, filePath, options);

if (response.ok) {
  response.saveToFile(savePath);
  console.log(`Visible signed OK: ${savePath}`);
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}