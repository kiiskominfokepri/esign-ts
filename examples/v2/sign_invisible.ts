import { createEsignClient, SignatureProperties } from '@kiiskominfokepri/esign';
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

const filePath = resolve(__dirname, '../../storage/TEST-TTE-ESIGN.pdf');
const savePath = resolve(__dirname, '../../storage/signed/v2-signed-test.pdf');

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

console.log('Signing document invisibly (V2)...');

const response = await esign.signInvisible(passphrase, filePath);

if (response.ok) {
  response.saveToFile(savePath);
  console.log(`Signed OK: ${savePath}`);
  if (response.getTimestamp()) {
    console.log(`Timestamp: ${response.getTimestamp()}`);
  }
  process.exit(0);
} else {
  console.error('Error:', response.errors);
  process.exit(1);
}