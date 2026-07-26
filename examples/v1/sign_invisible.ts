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
const passphrase = requireEnv('ESIGN_PASSPHRASE');

const filePath = resolve(__dirname, '../../storage/TEST-TTE-ESIGN.pdf');
const savePath = resolve(__dirname, '../../storage/signed/v1-signed-test.pdf');

const esign = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
  nik,
});

console.log('Signing document invisibly (V1)...');

const response = await esign.signInvisible(passphrase, filePath);

if (response.ok) {
  response.saveToFile(savePath);
  console.log(`Signed OK: ${savePath}`);
  if (response.getDocumentId()) {
    console.log(`id_dokumen: ${response.getDocumentId()}`);
  }
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}